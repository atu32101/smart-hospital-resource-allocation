package com.hospital.service;

import com.hospital.entity.Bed;
import com.hospital.repository.BedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BedService {

    private final BedRepository bedRepository;

    @Autowired
    public BedService(BedRepository bedRepository) {
        this.bedRepository = bedRepository;
    }

    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    public Optional<Bed> getBedById(Long id) {
        return bedRepository.findById(id);
    }

    public List<Bed> getAvailableBeds() {
        return bedRepository.findByStatus("AVAILABLE");
    }

    public List<Bed> getAvailableBedsByType(String bedType) {
        return bedRepository.findByBedTypeAndStatus(bedType.toUpperCase(), "AVAILABLE");
    }

    public List<Bed> filterBeds(String bedType, String status) {
        boolean hasType = bedType != null && !bedType.isBlank() && !"ALL".equalsIgnoreCase(bedType);
        boolean hasStatus = status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status);

        if (hasType && hasStatus) {
            return bedRepository.findByBedTypeAndStatus(bedType.toUpperCase(), status.toUpperCase());
        } else if (hasType) {
            return bedRepository.findByBedType(bedType.toUpperCase());
        } else if (hasStatus) {
            return bedRepository.findByStatus(status.toUpperCase());
        } else {
            return bedRepository.findAll();
        }
    }

    @Transactional
    public Bed createBed(Bed bed) {
        validateBed(bed);

        if (bedRepository.existsByBedNumber(bed.getBedNumber().trim())) {
            throw new IllegalArgumentException("Bed number '" + bed.getBedNumber().trim() + "' already exists");
        }

        bed.setBedNumber(bed.getBedNumber().trim().toUpperCase());
        bed.setBedType(bed.getBedType().trim().toUpperCase());
        if (bed.getStatus() == null || bed.getStatus().isBlank()) {
            bed.setStatus("AVAILABLE");
        }
        return bedRepository.save(bed);
    }

    @Transactional
    public Bed updateBed(Long id, Bed updated) {
        Bed existing = bedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bed with ID " + id + " not found"));

        validateBed(updated);

        String trimmedNumber = updated.getBedNumber().trim().toUpperCase();
        if (!existing.getBedNumber().equalsIgnoreCase(trimmedNumber) && bedRepository.existsByBedNumber(trimmedNumber)) {
            throw new IllegalArgumentException("Bed number '" + trimmedNumber + "' already exists");
        }

        existing.setBedNumber(trimmedNumber);
        existing.setBedType(updated.getBedType().trim().toUpperCase());
        existing.setFloor(updated.getFloor());
        if (updated.getStatus() != null && !updated.getStatus().isBlank()) {
            existing.setStatus(updated.getStatus().trim().toUpperCase());
        }

        return bedRepository.save(existing);
    }

    @Transactional
    public void deleteBed(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bed with ID " + id + " not found"));

        if ("OCCUPIED".equalsIgnoreCase(bed.getStatus()) || bed.getPatient() != null) {
            throw new IllegalStateException("Cannot delete an occupied bed. Please discharge or reassign the patient first.");
        }

        bedRepository.delete(bed);
    }

    private void validateBed(Bed bed) {
        if (bed.getBedNumber() == null || bed.getBedNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Bed number cannot be empty");
        }
        if (bed.getBedType() == null || bed.getBedType().trim().isEmpty()) {
            throw new IllegalArgumentException("Bed type is required (GENERAL, PRIVATE, ICU)");
        }
        if (bed.getFloor() == null) {
            throw new IllegalArgumentException("Floor number is required");
        }

        String type = bed.getBedType().toUpperCase().trim();
        if (!type.equals("GENERAL") && !type.equals("PRIVATE") && !type.equals("ICU")) {
            throw new IllegalArgumentException("Bed type must be one of: GENERAL, PRIVATE, ICU");
        }
    }
}
