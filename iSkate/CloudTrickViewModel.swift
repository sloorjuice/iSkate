//
//  CloudTrickViewModel.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/8/26.
//

import SwiftUI
import Supabase
internal import Combine

@MainActor
class CloudTrickViewModel: ObservableObject {
    @Published var progressRecords: [RemoteTrickProgress] = []
    @Published var isSyncing = false
    
    // Fetch user progress filtered strictly by the user's explicit token identity
    func fetchCloudProgress() async {
        guard let userId = SupabaseManager.client.auth.currentSession?.user.id else { return }
        isSyncing = true
        
        do {
            let records: [RemoteTrickProgress] = try await SupabaseManager.client
                .from("user_trick_progress")
                .select()
                .eq("user_id", value: userId.uuidString)
                .execute()
                .value
                
            self.progressRecords = records
        } catch {
            print("Query execution failure: \(error)")
        }
        isSyncing = false
    }
    
    // Remote Upsert Data Sync Task execution
    func toggleCloudCompletion(trickId: Int) async {
        guard let userId = SupabaseManager.client.auth.currentSession?.user.id else { return }
        
        // Find match or build clean default profile wrapper
        let existingRecord = progressRecords.first(where: { $0.trickId == trickId })
        let updatedStatus = !(existingRecord?.isCompleted ?? false)
        
        let updatePayload = RemoteTrickProgress(
            id: existingRecord?.id,
            userId: userId,
            trickId: trickId,
            isCompleted: updatedStatus,
            cachedVideoIds: existingRecord?.cachedVideoIds ?? [],
            lastUpdated: Date()
        )
        
        do {
            // Executes remote upsert routine, overwriting duplicate constraints gracefully via SQL indexes
            try await SupabaseManager.client
                .from("user_trick_progress")
                .upsert(updatePayload)
                .execute()
                
            // Reload state array cleanly locally
            await fetchCloudProgress()
        } catch {
            print("Execution sync upsert error matching payload tracking: \(error)")
        }
    }
}
