//
//  SkateMapView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import SwiftUI
import MapKit

struct SkateMapView: View {
    // Initialize the manager to trigger the permission prompt
   @State private var locationManager = LocationManager()
   
   // Set the camera position to automatically follow the user
   @State private var cameraPosition: MapCameraPosition = .userLocation(fallback: .automatic)
   
   var body: some View {
       Map(position: $cameraPosition) {
           // Displays the default blue user indicator dot on the map
           UserAnnotation()
       }
       // Adds standard map controls like a "re-center on me" button
       .mapControls {
           MapUserLocationButton()
           MapCompass()
       }
   }
}

#Preview {
    SkateMapView()
}
