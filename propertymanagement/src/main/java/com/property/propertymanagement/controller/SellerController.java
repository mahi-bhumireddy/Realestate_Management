package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.Property;
import com.property.propertymanagement.model.Advertisement;
import com.property.propertymanagement.service.PropertyService;
import com.property.propertymanagement.service.AdvertisementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "http://localhost:3000")
public class SellerController {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private AdvertisementService advertisementService;

    @PostMapping(value = "/property", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProperty(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("location") String location,
            @RequestParam("propertyType") String propertyType,
            @RequestParam(value = "bedrooms", required = false) Integer bedrooms,
            @RequestParam(value = "bathrooms", required = false) Integer bathrooms,
            @RequestParam(value = "area", required = false) Double area,
            @RequestParam(value = "amenities", required = false) String amenities,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        try {
            Property property = new Property();
            property.setTitle(title);
            property.setDescription(description);
            property.setPrice(price);
            property.setLocation(location);
            property.setType(propertyType);
            property.setBedrooms(bedrooms);
            property.setBathrooms(bathrooms);
            property.setSquareFeet(area);
            property.setStatus("available");
            
            if (image != null && !image.isEmpty()) {
                property.setImageUrls(image.getOriginalFilename());
                // TODO: Save image to file system or convert to base64
            }
            
            Property savedProperty = propertyService.createProperty(property, authentication);
            return ResponseEntity.ok(savedProperty);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/myProperty")
    public ResponseEntity<?> getMyProperties(Authentication authentication) {
        try {
            List<Property> properties = propertyService.getSellerProperties(authentication);
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/advertise")
    public ResponseEntity<?> createAdvertisement(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            Long propertyId = Long.parseLong(request.get("propertyId").toString());
            String title = (String) request.get("title");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            
            Advertisement advertisement = new Advertisement();
            advertisement.setTitle(title);
            advertisement.setStatus("pending");
            // Set other fields as needed
            
            Advertisement savedAd = advertisementService.createAdvertisement(advertisement, propertyId, authentication);
            return ResponseEntity.ok(savedAd);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/advertisement-status")
    public ResponseEntity<?> getAdvertisementStatus(Authentication authentication) {
        try {
            List<Advertisement> advertisements = advertisementService.getSellerAdvertisements(authentication);
            return ResponseEntity.ok(advertisements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
} 