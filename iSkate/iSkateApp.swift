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
    // 1. Create a custom container container instance
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Trick.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
            
            // 2. Check if the database is empty on background context to avoid blocking the UI
            Task { @MainActor in
                let context = container.mainContext
                let trickFetch = FetchDescriptor<Trick>()
                
                // If no tricks exist in the DB, parse the JSON and insert them
                if let count = try? context.fetchCount(trickFetch), count == 0 {
                    let initialTricks = loadTricks()
                    for trick in initialTricks {
                        context.insert(trick)
                    }
                    // Save the context to persist the inserts
                    try? context.save()
                    print("Successfully seeded \(initialTricks.count) tricks into SwiftData.")
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
        // 3. Attach the configured container to the app scene
        .modelContainer(sharedModelContainer)
    }
}
