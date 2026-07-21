//
//  AuthManager.swift
//  iSkate
//
//  Created by Anthony Reynolds on 7/8/26.
//

import Foundation
import Supabase
internal import Combine

@MainActor
class AuthManager: ObservableObject {
    @Published var session: Session? = nil
    @Published var isLoading = true
    
    private var authTask: Task<Void, Never>? = nil
    
    init() {
        listenToAuthChanges()
    }
    
    func listenToAuthChanges() {
        authTask = Task {
            for await (event, currentSession) in SupabaseManager.client.auth.authStateChanges {
                self.session = currentSession
                self.isLoading = false
                print("Auth Event Triggered: \(event)")
            }
        }
    }
    
    deinit {
        authTask?.cancel()
    }
    
    func signUp(email: String, password: String) async throws {
        _ = try await SupabaseManager.client.auth.signUp(email: email, password: password)
    }
    
    func signIn(email: String, password: String) async throws {
        _ = try await SupabaseManager.client.auth.signIn(email: email, password: password)
    }
    
    func signOut() async throws {
        try await SupabaseManager.client.auth.signOut()
    }
    
    func handleDeepLink(url: URL) async {
        do {
            try await SupabaseManager.client.auth.session(from: url)
        } catch {
            print("Deep link token processing failure: \(error.localizedDescription)")
        }
    }
}
