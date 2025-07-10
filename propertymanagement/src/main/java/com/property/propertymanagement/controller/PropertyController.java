package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.Property;
import com.property.propertymanagement.security.UserPrincipal;
import com.property.propertymanagement.service.PropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "http://localhost:3000")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProperty(@PathVariable Long id) {
        return propertyService.getPropertyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProperty(@RequestBody Property property, 
                                          Authentication authentication) {
        try {
            Property savedProperty = propertyService.createProperty(property, authentication);
            return ResponseEntity.ok(savedProperty);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(@PathVariable Long id, 
                                          @RequestBody Property propertyDetails,
                                          @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            return propertyService.updateProperty(id, propertyDetails, currentUser.getId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long id, 
                                          @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            propertyService.deleteProperty(id, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/seller")
    public ResponseEntity<?> getSellerProperties(Authentication authentication) {
        try {
            List<Property> properties = propertyService.getSellerProperties(authentication);
            return ResponseEntity.ok(properties);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/buyer")
    public ResponseEntity<?> getBuyerProperties(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            List<Property> properties = propertyService.getBuyerProperties(currentUser.getId());
            return ResponseEntity.ok(properties);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public List<Property> searchProperties(@RequestParam(required = false) String location,
                                         @RequestParam(required = false) String type,
                                         @RequestParam(required = false) String status) {
        return propertyService.searchProperties(location, type, status);
    }
} 