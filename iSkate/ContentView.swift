 //
//  ContentView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/3/26.
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab: TabIdentifier = .tricks
    
    enum TabIdentifier: String, Hashable {
        case tricks = "com.myapp.tricks"
        case map = "com.myapp.map"
        case messages = "com.myapp.messages"
        case search = "com.myapp.search"
        case profile = "com.myapp.profile"
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            Tab(Constants.trickListString, systemImage: Constants.trickListIconString, value: .tricks) {
                TrickListView()
            }
            
            Tab(Constants.skateMapString, systemImage: Constants.skateMapIconString, value: .map) {
                SkateMapView()
            }
            
            Tab(Constants.messagesString, systemImage: Constants.messagesIconString, value: .messages) {
                Text(Constants.messagesString)
            }
            
            Tab(Constants.searchString, systemImage: Constants.searchIconString, value: .search) {
                Text(Constants.searchString)
            }
            
            Tab(Constants.profileString, systemImage: Constants.profileIconString, value: .profile) {
                ProfileView()
            }
        }
        .tabViewStyle(.sidebarAdaptable)
        .tabBarMinimizeBehavior(.onScrollDown)
    }
}

#Preview {
    ContentView()
}
