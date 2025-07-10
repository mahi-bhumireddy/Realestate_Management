package com.property.propertymanagement.controller;

import com.property.propertymanagement.model.Advertisement;
import com.property.propertymanagement.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/advertisements")
    public ResponseEntity<?> getAdvertisements(Authentication authentication) {
        try {
            List<Advertisement> advertisements = employeeService.getAllAdvertisements();
            return ResponseEntity.ok(advertisements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching advertisements: " + e.getMessage());
        }
    }

    @PostMapping(value = "/advertisement", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> createAdvertisement(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            Authentication authentication) {
        try {
            Advertisement advertisement = employeeService.createAdvertisement(title, description, file);
            return ResponseEntity.ok(advertisement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing file upload: " + e.getMessage());
        }
    }

    @PutMapping("/advertisement/{id}")
    public ResponseEntity<?> updateAdvertisement(@PathVariable Long id, @RequestBody Map<String, Object> request, Authentication authentication) {
        // TODO: Implement updating advertisement
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/advertisement/{id}")
    public ResponseEntity<?> deleteAdvertisement(@PathVariable Long id, Authentication authentication) {
        // TODO: Implement deleting advertisement
        return ResponseEntity.ok().build();
    }

    @GetMapping("/advertisement-requests")
    public ResponseEntity<?> getAdvertisementRequests(Authentication authentication) {
        // TODO: Implement getting advertisement requests
        return ResponseEntity.ok().build();
    }

    @PostMapping("/advertisement-request/status")
    public ResponseEntity<?> updateAdvertisementRequestStatus(@RequestBody Map<String, Object> request, Authentication authentication) {
        // TODO: Implement updating advertisement request status
        return ResponseEntity.ok().build();
    }
} 