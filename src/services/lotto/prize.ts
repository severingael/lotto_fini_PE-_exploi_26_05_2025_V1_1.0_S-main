import { collection, addDoc, getDocs, query, where, updateDoc, doc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LottoEvent, LottoParticipation } from './types';

export interface LottoPrize {
  id?: string;
  lottoId: string;
  calculationDate: string;
  winningNumbers: number[];
  jackpotAmount: number;
  prizeDistribution: {
    numbers: number;
    amount: number;
  }[];
  winners: {
    userId: string;
    matchedNumbers: number;
    prize: number;
  }[];
}

export interface ApprovalRequest {
  id?: string;
  lottoId: string;
  draw: any;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  reason?: string;
  votes?: ApprovalVote[];
  history?: ApprovalHistory[];
  request_type?: string;
}

export interface ApprovalVote {
  id?: string;
  requestId: string;
  managerId: string;
  managerEmail?: string;
  decision: 'approve' | 'reject';
  comment?: string | null;
  createdAt: string;
}

export interface ApprovalHistory {
  id?: string;
  requestId: string;
  userId: string;
  userEmail?: string;
  action: 'created' | 'approved' | 'rejected' | 'commented' | 'processed';
  details?: any;
  createdAt: string;
}

export class LottoPrizeService {
  static async calculatePrizes(
    lottoId: string,
    winningNumbers: number[],
    jackpotAmount: number,
    prizeDistribution: { numbers: number; amount: number }[]
  ): Promise<LottoPrize> {
    try {
      const participationsRef = collection(db, 'lotto_participations');
      const q = query(
        participationsRef, 
        where('lottoId', '==', lottoId),
        where('status', '==', 'active')
      );
      const participationsSnapshot = await getDocs(q);
      const participations = participationsSnapshot.docs;

      const batch = writeBatch(db);
      const winnersCount = new Map<number, number>();
      const winners: { userId: string; matchedNumbers: number; prize: number }[] = [];

      participations.forEach(doc => {
        const participation = doc.data() as LottoParticipation;
        const matchedNumbers = participation.selectedNumbers.filter(num => 
          winningNumbers.includes(num)
        ).length;

        const prizeLevel = prizeDistribution.find(p => p.numbers === matchedNumbers);
        const prizeAmount = prizeLevel ? prizeLevel.amount : 0;

        winnersCount.set(matchedNumbers, (winnersCount.get(matchedNumbers) || 0) + 1);

        if (prizeAmount > 0) {
          winners.push({
            userId: participation.userId,
            matchedNumbers,
            prize: prizeAmount
          });

          batch.update(doc.ref, {
            isWinner: true,
            winAmount: prizeAmount,
            matchedNumbers,
            status: 'completed'
          });
        } else {
          batch.update(doc.ref, {
            isWinner: false,
            winAmount: 0,
            matchedNumbers,
            status: 'completed',
            isLost: true
          });
        }
      });

      const lottoRef = doc(db, 'lottos', lottoId);
      batch.update(lottoRef, {
        prizeCalculated: true,
        winningNumbers,
        status: 'completed'
      });

      await batch.commit();

      const prizeResult: LottoPrize = {
        lottoId,
        calculationDate: new Date().toISOString(),
        winningNumbers,
        jackpotAmount,
        prizeDistribution,
        winners
      };

      const prizeRef = await addDoc(collection(db, 'lotto_prizes'), prizeResult);

      return {
        ...prizeResult,
        id: prizeRef.id
      };
    } catch (error) {
      console.error('Error calculating prizes:', error);
      throw new Error('Failed to calculate prizes');
    }
  }

  static async getPrizeResult(lottoId: string): Promise<LottoPrize | null> {
    try {
      const prizesRef = collection(db, 'lotto_prizes');
      const q = query(prizesRef, where('lottoId', '==', lottoId));
      const prizeSnapshot = await getDocs(q);

      if (prizeSnapshot.empty) {
        return null;
      }

      const prizeDoc = prizeSnapshot.docs[0];
      return {
        id: prizeDoc.id,
        ...prizeDoc.data()
      } as LottoPrize;
    } catch (error) {
      console.error('Error getting prize result:', error);
      throw new Error('Failed to get prize result');
    }
  }

  static async calculateMatchingStats(lottoId: string, winningNumbers: number[]): Promise<{ [key: number]: number }> {
    try {
      const participationsRef = collection(db, 'lotto_participations');
      const q = query(
        participationsRef, 
        where('lottoId', '==', lottoId),
        where('status', '==', 'active')
      );
      const participationsSnapshot = await getDocs(q);
      
      const stats: { [key: number]: number } = {};
      
      participationsSnapshot.docs.forEach(doc => {
        const participation = doc.data();
        const matchedNumbers = participation.selectedNumbers.filter((num: number) => 
          winningNumbers.includes(num)
        ).length;
        
        stats[matchedNumbers] = (stats[matchedNumbers] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error calculating matching stats:', error);
      throw new Error('Failed to calculate matching statistics');
    }
  }

  static async createApprovalRequest(request: Omit<ApprovalRequest, 'id' | 'votes'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'approval_requests'), {
        ...request,
        request_type: 'prize_calculation'
      });
      
      await addDoc(collection(db, 'approval_history'), {
        requestId: docRef.id,
        userId: request.requestedBy,
        action: 'created',
        details: {
          lottoId: request.lottoId,
          requestType: 'prize_calculation'
        },
        createdAt: new Date().toISOString()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating approval request:', error);
      throw new Error('Failed to create approval request');
    }
  }

  static async getApprovalRequests(): Promise<ApprovalRequest[]> {
    try {
      const approvalsRef = collection(db, 'approval_requests');
      const approvalsSnapshot = await getDocs(approvalsRef);
      
      const requests = await Promise.all(approvalsSnapshot.docs.map(async (approvalDoc) => {
        const requestData = approvalDoc.data() as ApprovalRequest;
        
        // Get votes for this request
        const votesRef = collection(db, 'approval_votes');
        const votesQuery = query(votesRef, where('requestId', '==', approvalDoc.id));
        const votesSnapshot = await getDocs(votesQuery);
        
        const votes = await Promise.all(votesSnapshot.docs.map(async (voteDoc) => {
          const voteData = voteDoc.data() as ApprovalVote;
          
          // Get manager email
          const managerRef = doc(db, 'users', voteData.managerId);
          const managerSnap = await getDoc(managerRef);
          const managerEmail = managerSnap.exists() ? managerSnap.data().email : 'Unknown';
          
          return {
            ...voteData,
            id: voteDoc.id,
            managerEmail
          };
        }));
        
        return {
          ...requestData,
          id: approvalDoc.id,
          votes
        };
      }));
      
      return requests;
    } catch (error) {
      console.error('Error getting approval requests:', error);
      throw new Error('Failed to get approval requests');
    }
  }

  static async getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
    try {
      const requestRef = doc(db, 'approval_requests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        return null;
      }
      
      const requestData = requestSnap.data() as ApprovalRequest;
      
      const votesRef = collection(db, 'approval_votes');
      const votesQuery = query(votesRef, where('requestId', '==', requestId));
      const votesSnapshot = await getDocs(votesQuery);
      
      const votes = await Promise.all(votesSnapshot.docs.map(async (voteDoc) => {
        const voteData = voteDoc.data() as ApprovalVote;
        
        const managerRef = doc(db, 'users', voteData.managerId);
        const managerSnap = await getDoc(managerRef);
        const managerEmail = managerSnap.exists() ? managerSnap.data().email : 'Unknown';
        
        return {
          ...voteData,
          id: voteDoc.id,
          managerEmail
        };
      }));
      
      const historyRef = collection(db, 'approval_history');
      const historyQuery = query(historyRef, where('requestId', '==', requestId));
      const historySnapshot = await getDocs(historyQuery);
      
      const history = await Promise.all(historySnapshot.docs.map(async (historyDoc) => {
        const historyData = historyDoc.data() as ApprovalHistory;
        
        const userRef = doc(db, 'users', historyData.userId);
        const userSnap = await getDoc(userRef);
        const userEmail = userSnap.exists() ? userSnap.data().email : 'Unknown';
        
        return {
          ...historyData,
          id: historyDoc.id,
          userEmail
        };
      }));
      
      return {
        ...requestData,
        id: requestId,
        votes,
        history
      };
    } catch (error) {
      console.error('Error getting approval request:', error);
      throw new Error('Failed to get approval request');
    }
  }

  static async voteOnRequest(
    requestId: string, 
    managerId: string, 
    decision: 'approve' | 'reject', 
    comment?: string
  ): Promise<void> {
    try {
      const requestRef = doc(db, 'approval_requests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Approval request not found');
      }
      
      const requestData = requestSnap.data() as ApprovalRequest;
      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      const votesRef = collection(db, 'approval_votes');
      const existingVoteQuery = query(
        votesRef, 
        where('requestId', '==', requestId),
        where('managerId', '==', managerId)
      );
      const existingVoteSnap = await getDocs(existingVoteQuery);
      
      const voteData: Omit<ApprovalVote, 'id'> = {
        requestId,
        managerId,
        decision,
        comment: comment || null,
        createdAt: new Date().toISOString()
      };
      
      if (!existingVoteSnap.empty) {
        const voteRef = doc(db, 'approval_votes', existingVoteSnap.docs[0].id);
        await updateDoc(voteRef, voteData);
      } else {
        await addDoc(collection(db, 'approval_votes'), voteData);
      }
      
      await addDoc(collection(db, 'approval_history'), {
        requestId,
        userId: managerId,
        action: decision === 'approve' ? 'approved' : 'rejected',
        details: { comment: comment || null },
        createdAt: new Date().toISOString()
      });
      
      const allVotesQuery = query(votesRef, where('requestId', '==', requestId));
      const allVotesSnap = await getDocs(allVotesQuery);
      
      const votes = allVotesSnap.docs.map(doc => doc.data() as ApprovalVote);
      const approvalCount = votes.filter(v => v.decision === 'approve').length;
      const rejectionCount = votes.filter(v => v.decision === 'reject').length;
      
      if (rejectionCount > 0) {
        await updateDoc(requestRef, {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: managerId,
          reason: 'Rejected by at least one manager'
        });
        
        await addDoc(collection(db, 'approval_history'), {
          requestId,
          userId: managerId,
          action: 'processed',
          details: {
            finalStatus: 'rejected',
            reason: 'Rejected by at least one manager'
          },
          createdAt: new Date().toISOString()
        });
      } else if (approvalCount >= 2) {
        await updateDoc(requestRef, {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: managerId
        });
        
        await addDoc(collection(db, 'approval_history'), {
          requestId,
          userId: managerId,
          action: 'processed',
          details: {
            finalStatus: 'approved',
            reason: 'Approved by at least two managers'
          },
          createdAt: new Date().toISOString()
        });
        
        // Vérifier le type de demande et traiter en conséquence
        if (requestData.request_type === 'prize_calculation') {
          await this.processPrizeCalculation(requestId);
        }
      }
    } catch (error) {
      console.error('Error voting on request:', error);
      throw error;
    }
  }

  static async approveRequest(requestId: string, approverId: string): Promise<void> {
    try {
      await this.voteOnRequest(requestId, approverId, 'approve');
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  static async rejectRequest(requestId: string, rejectorId: string, reason: string): Promise<void> {
    try {
      await this.voteOnRequest(requestId, rejectorId, 'reject', reason);
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  static async processPrizeCalculation(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, 'approval_requests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Approval request not found');
      }
      
      const request = requestSnap.data() as ApprovalRequest;
      
      if (request.status !== 'approved') {
        throw new Error('Cannot process unapproved request');
      }
      
      const lottoId = request.lottoId;
      const drawData = request.draw;
      
      await this.calculatePrizes(
        lottoId,
        drawData.winningNumbers,
        drawData.jackpotAmount,
        drawData.prizeDistribution
      );
      
      await updateDoc(requestRef, {
        processed: true,
        processedAt: new Date().toISOString()
      });
      
      await addDoc(collection(db, 'approval_history'), {
        requestId,
        userId: request.approvedBy || '',
        action: 'processed',
        details: {
          lottoId,
          winningNumbers: drawData.winningNumbers
        },
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing prize calculation:', error);
      throw error;
    }
  }

  static async getApprovalHistory(requestId: string): Promise<ApprovalHistory[]> {
    try {
      const historyRef = collection(db, 'approval_history');
      const q = query(
        historyRef,
        where('requestId', '==', requestId)
      );
      
      const snapshot = await getDocs(q);
      
      const history = await Promise.all(snapshot.docs.map(async (historyDoc) => {
        const historyData = historyDoc.data() as ApprovalHistory;
        
        const userRef = doc(db, 'users', historyData.userId);
        const userSnap = await getDoc(userRef);
        const userEmail = userSnap.exists() ? userSnap.data().email : 'Unknown';
        
        return {
          ...historyData,
          id: historyDoc.id,
          userEmail
        };
      }));
      
      return history.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting approval history:', error);
      throw new Error('Failed to get approval history');
    }
  }
}