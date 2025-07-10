package com.property.propertymanagement.service;

import com.property.propertymanagement.model.Advertisement;
import com.property.propertymanagement.model.Property;
import com.property.propertymanagement.model.User;
import com.property.propertymanagement.repository.AdvertisementRepository;
import com.property.propertymanagement.repository.PropertyRepository;
import com.property.propertymanagement.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AdvertisementService {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    public List<Advertisement> getAllAdvertisements() {
        return advertisementRepository.findAll();
    }

    public Optional<Advertisement> getAdvertisementById(Long id) {
        return advertisementRepository.findById(id);
    }

    public Advertisement createAdvertisement(Advertisement advertisement, Long propertyId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to create advertisement for this property");
        }

        advertisement.setProperty(property);
        return advertisementRepository.save(advertisement);
    }

    public Optional<Advertisement> updateAdvertisement(Long id, Advertisement adDetails, Long userId) {
        return advertisementRepository.findById(id)
                .map(ad -> {
                    if (!ad.getProperty().getSeller().getId().equals(userId)) {
                        throw new RuntimeException("Not authorized to update this advertisement");
                    }
                    ad.setTitle(adDetails.getTitle());
                    ad.setDescription(adDetails.getDescription());
                    ad.setStatus(adDetails.getStatus());
                    ad.setStartDate(adDetails.getStartDate());
                    ad.setEndDate(adDetails.getEndDate());
                    ad.setAdCost(adDetails.getAdCost());
                    return advertisementRepository.save(ad);
                });
    }

    public void deleteAdvertisement(Long id, Long userId) {
        advertisementRepository.findById(id)
                .ifPresent(ad -> {
                    if (!ad.getProperty().getSeller().getId().equals(userId)) {
                        throw new RuntimeException("Not authorized to delete this advertisement");
                    }
                    advertisementRepository.delete(ad);
                });
    }

    public List<Advertisement> getPropertyAdvertisements(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        return advertisementRepository.findByProperty(property);
    }

    public List<Advertisement> getSellerAdvertisements(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long sellerId = userPrincipal.getId();
        return advertisementRepository.findByPropertySellerId(sellerId);
    }

    public List<Advertisement> getActiveAdvertisements() {
        return advertisementRepository.findByStatus("Active");
    }

    public List<Advertisement> getExpiredAdvertisements() {
        return advertisementRepository.findByEndDateBefore(LocalDateTime.now());
    }

    public List<Advertisement> getUpcomingAdvertisements() {
        return advertisementRepository.findByStartDateAfter(LocalDateTime.now());
    }
} 