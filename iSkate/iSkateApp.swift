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
        let schema = Schema([
            Trick.self,
        ])
        
        // Check if we are running inside an Xcode Preview
        let isPreview = ProcessInfo.processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
        
        // Force in-memory storage for previews so schema changes never cause a crash
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: isPreview
        )

        do {
            let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
            
            // If it's a preview, we can still seed it in memory so your canvas actually has data!
            Task { @MainActor in
                let context = container.mainContext
                let trickFetch = FetchDescriptor<Trick>()
                
                if let count = try? context.fetchCount(trickFetch), count == 0 {
                    let initialTricks = loadTricks()
                    for trick in initialTricks {
                        context.insert(trick)
                    }
                    try? context.save()
                }
            }
            
            return container
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
