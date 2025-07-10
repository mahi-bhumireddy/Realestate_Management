package com.property.propertymanagement.service;

import com.property.propertymanagement.model.Advertisement;
import com.property.propertymanagement.repository.AdvertisementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.List;

@Service
@Transactional
public class EmployeeService {

    @Autowired
    private AdvertisementRepository advertisementRepository;

    public List<Advertisement> getAllAdvertisements() {
        return advertisementRepository.findAll();
    }

    public Advertisement createAdvertisement(String title, String description, MultipartFile file) throws Exception {
        Advertisement advertisement = new Advertisement();
        advertisement.setTitle(title);
        advertisement.setDescription(description);
        
        if (file != null && !file.isEmpty()) {
            // Convert image to Base64
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            advertisement.setImageContent(base64Image);
        }

        return advertisementRepository.save(advertisement);
    }
} 