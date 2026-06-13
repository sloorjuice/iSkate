//
//  CLLocationManager.swift
//  iSkate
//
//  Created by Anthony Reynolds on 6/12/26.
//

import CoreLocation

@Observable
class LocationManager {
    private let manager = CLLocationManager()
    
    init() {
        // Request permission immediately when initialized
        manager.requestWhenInUseAuthorization()
    }
}
