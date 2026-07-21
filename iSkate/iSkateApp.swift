//
//  iSkateApp.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/3/26.
//

import SwiftUI

@main
struct iSkateApp: App {
    @StateObject private var authManager = AuthManager()

    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isLoading {
                    ProgressView("Loading your skate profile...")
                        .progressViewStyle(.circular)
                } else if authManager.session != nil {
                    ContentView()
                } else {
                    AuthView()
                }
            }
            .environmentObject(authManager)
            .onOpenURL { url in
                Task {
                    await authManager.handleDeepLink(url: url)
                }
            }
        }
    }
}
