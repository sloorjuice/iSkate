 //
//  ContentView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/3/26.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    var body: some View {
        TabView {
            Tab(Constants.trickListString, systemImage: Constants.trickListIconString) {
                TrickListView()
            }
            Tab(Constants.profileString, systemImage: Constants.profileIconString) {
                Text(Constants.profileString)
            }
            Tab(Constants.settingsString, systemImage: Constants.settingsIconString) {
                Text(Constants.settingsString)
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(.previewContainer)
}
