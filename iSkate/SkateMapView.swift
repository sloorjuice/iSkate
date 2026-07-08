//
//  SkateMapView.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import SwiftUI
import MapKit

struct SkateSpot: Identifiable {
    let id = UUID()
    var coordinate: CLLocationCoordinate2D
}

struct SkateMapView: View {
    // Initialize the manager to trigger the permission prompt
    @State private var locationManager = LocationManager()
    
    // Set the camera position to automatically follow the user
    @State private var cameraPosition: MapCameraPosition = .userLocation(fallback: .automatic)
    
    @State private var skateSpots: [SkateSpot] = []
    
    var body: some View {
        MapReader { proxy in
            Map(position: $cameraPosition) {
                // Displays the default blue user indicator dot on the map
                UserAnnotation()
                ForEach(skateSpots) { location in
                    Marker("SkateSpot", coordinate: location.coordinate)
                        .tint(.red)
                }
            }
            // Adds standard map controls like a "re-center on me" button
            .mapControls {
                MapUserLocationButton()
                MapCompass()
            }
            .mapStyle(.standard)
            .gesture(
                LongPressGesture(minimumDuration: 1.0)
                    .sequenced(before: DragGesture(minimumDistance: 0))
                    .onEnded { value in
                        // Use pattern matching to extract the drag gesture value from the sequence
                        switch value {
                        case .second(true, let dragValue):
                            if let dragLocation = dragValue?.startLocation {
                                if let coordinate = proxy.convert(dragLocation, from: .local) {
                                    saveSpot(coordinate)
                                }
                            }
                        default:
                            break
                        }
                    }
            )
        }
    }
    
    private func saveSpot(_ coordinate: CLLocationCoordinate2D) {
        let newSpot = SkateSpot(coordinate: coordinate)
        skateSpots.append(newSpot)
        print("Saved coordinates: Lat \(coordinate.latitude), Lon \(coordinate.longitude)")
    }
    
}



#Preview {
    SkateMapView()
}
