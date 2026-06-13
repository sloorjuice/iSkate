//
//  iSkateApp.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/3/26.
//

import SwiftUI
import SwiftData

@main
struct iSkateApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([TrickProgress.self])
        let isPreview = ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: isPreview)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
    }
}
