//
//  ProfileView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/12/26.
//

import SwiftUI
import Supabase

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        Text(SupabaseManager.client.auth.currentUser?.email ?? "No User Found")
        
        Button("Log Out") {
            Task {
                do {
                    try await authManager.signOut()
                } catch {
                    print("Failed to sign out: \(error.localizedDescription)")
                }
            }
        }
    }
}

#Preview {
    ProfileView()
}
