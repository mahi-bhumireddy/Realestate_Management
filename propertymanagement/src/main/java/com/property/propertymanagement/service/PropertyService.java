package com.property.propertymanagement.service;

import com.property.propertymanagement.model.Property;
import com.property.propertymanagement.model.User;
import com.property.propertymanagement.repository.PropertyRepository;
import com.property.propertymanagement.repository.UserRepository;
import com.property.propertymanagement.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    public Property createProperty(Property property, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long sellerId = userPrincipal.getId();
        
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        property.setSeller(seller);
        return propertyRepository.save(property);
    }

    public Optional<Property> updateProperty(Long id, Property propertyDetails, Long userId) {
        return propertyRepository.findById(id)
                .map(property -> {
                    if (!property.getSeller().getId().equals(userId)) {
                        throw new RuntimeException("Not authorized to update this property");
                    }
                    property.setTitle(propertyDetails.getTitle());
                    property.setDescription(propertyDetails.getDescription());
                    property.setPrice(propertyDetails.getPrice());
                    property.setLocation(propertyDetails.getLocation());
                    property.setType(propertyDetails.getType());
                    property.setStatus(propertyDetails.getStatus());
                    property.setSquareFeet(propertyDetails.getSquareFeet());
                    property.setBedrooms(propertyDetails.getBedrooms());
                    property.setBathrooms(propertyDetails.getBathrooms());
                    property.setYearBuilt(propertyDetails.getYearBuilt());
                    property.setImageUrls(propertyDetails.getImageUrls());
                    return propertyRepository.save(property);
                });
    }

    public void deleteProperty(Long id, Long userId) {
        propertyRepository.findById(id)
                .ifPresent(property -> {
                    if (!property.getSeller().getId().equals(userId)) {
                        throw new RuntimeException("Not authorized to delete this property");
                    }
                    propertyRepository.delete(property);
                });
    }

    public List<Property> getSellerProperties(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long sellerId = userPrincipal.getId();
        
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return propertyRepository.findBySeller(seller);
    }

    public List<Property> getBuyerProperties(Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));
        return propertyRepository.findByBuyer(buyer);
    }

    public List<Property> searchProperties(String location, String type, String status) {
        if (location != null && !location.isEmpty()) {
            return propertyRepository.findByLocationContainingIgnoreCase(location);
        } else if (type != null && !type.isEmpty()) {
            return propertyRepository.findByType(type);
        } else if (status != null && !status.isEmpty()) {
            return propertyRepository.findByStatus(status);
        }
        return getAllProperties();
    }
} 