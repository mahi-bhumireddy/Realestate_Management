package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.Advertisement;
import com.property.propertymanagement.security.UserPrincipal;
import com.property.propertymanagement.service.AdvertisementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advertisements")
@CrossOrigin(origins = "http://localhost:3000")
public class AdvertisementController {

    @Autowired
    private AdvertisementService advertisementService;

    @GetMapping
    public List<Advertisement> getAllAdvertisements() {
        return advertisementService.getAllAdvertisements();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAdvertisement(@PathVariable Long id) {
        return advertisementService.getAdvertisementById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createAdvertisement(@RequestBody Advertisement advertisement, 
                                               Authentication authentication) {
        try {
            Advertisement savedAd = advertisementService.createAdvertisement(
                advertisement, 
                advertisement.getProperty().getId(), 
                authentication
            );
            return ResponseEntity.ok(savedAd);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdvertisement(@PathVariable Long id, 
                                               @RequestBody Advertisement adDetails,
                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            return advertisementService.updateAdvertisement(id, adDetails, currentUser.getId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdvertisement(@PathVariable Long id, 
                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            advertisementService.deleteAdvertisement(id, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getPropertyAdvertisements(@PathVariable Long propertyId) {
        try {
            List<Advertisement> ads = advertisementService.getPropertyAdvertisements(propertyId);
            return ResponseEntity.ok(ads);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/active")
    public List<Advertisement> getActiveAdvertisements() {
        return advertisementService.getActiveAdvertisements();
    }

    @GetMapping("/expired")
    public List<Advertisement> getExpiredAdvertisements() {
        return advertisementService.getExpiredAdvertisements();
    }

    @GetMapping("/upcoming")
    public List<Advertisement> getUpcomingAdvertisements() {
        return advertisementService.getUpcomingAdvertisements();
    }
} 