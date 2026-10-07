package com.hospital.service;

import com.hospital.dto.RecommendationResponse;
import com.hospital.entity.Allocation;
import com.hospital.entity.Bed;
import com.hospital.entity.Patient;
import com.hospital.repository.AllocationRepository;
import com.hospital.repository.BedRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AllocationService {

    private final PatientRepository patientRepository;
    private final BedRepository bedRepository;
    private final AllocationRepository allocationRepository;

    @Autowired
    public AllocationService(PatientRepository patientRepository,
                             BedRepository bedRepository,
                             AllocationRepository allocationRepository) {
        this.patientRepository = patientRepository;
        this.bedRepository = bedRepository;
        this.allocationRepository = allocationRepository;
    }

    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAllByOrderByIdDesc();
    }

    public RecommendationResponse recommendBed(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        if (!"WAITING".equalsIgnoreCase(patient.getStatus())) {
            RecommendationResponse response = new RecommendationResponse(false,
                    "Patient is already " + patient.getStatus().toLowerCase() + " and cannot be allocated a new bed.");
            response.setPatient(patient);
            return response;
        }

        String reqType = patient.getRequiredBedType().toUpperCase().trim();
        String priority = patient.getPriority().toUpperCase().trim();

        int score = switch (priority) {
            case "CRITICAL" -> 4;
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            case "LOW" -> 1;
            default -> 1;
        };

        // Query available beds of the required type
        List<Bed> availableBeds = bedRepository.findByBedTypeAndStatus(reqType, "AVAILABLE");

        RecommendationResponse response = new RecommendationResponse();
        response.setPatient(patient);
        response.setPriorityScore(score);

        if (availableBeds.isEmpty()) {
            response.setFound(false);
            response.setMessage("No suitable " + reqType + " bed is currently available. Patient remains in the pending allocation list.");
            return response;
        }

        // Pick first available bed matching type
        Bed recommendedBed = availableBeds.get(0);
        response.setFound(true);
        response.setRecommendedBed(recommendedBed);
        response.setMessage("Suitable bed found for patient " + patient.getName());

        // Add detailed audit reasons
        response.addReason("✓ " + reqType + " bed available (" + recommendedBed.getBedNumber() + " on Floor " + recommendedBed.getFloor() + ")");
        response.addReason("✓ Suitable bed type matches requirement (" + reqType + ")");
        response.addReason("✓ Patient priority evaluated as " + priority + " (Priority Score: " + score + "/4)");

        return response;
    }

    @Transactional
    public Allocation acceptAllocation(Long patientId, Long bedId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + patientId));

        if (!"WAITING".equalsIgnoreCase(patient.getStatus())) {
            throw new IllegalStateException("Patient is not waiting for allocation. Current status: " + patient.getStatus());
        }

        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new IllegalArgumentException("Bed not found with ID: " + bedId));

        if (!"AVAILABLE".equalsIgnoreCase(bed.getStatus())) {
            throw new IllegalStateException("Bed " + bed.getBedNumber() + " is already occupied. Cannot allocate.");
        }

        // 1. Update Bed Status
        bed.setStatus("OCCUPIED");
        bed.setPatient(patient);
        bedRepository.save(bed);

        // 2. Update Patient Status
        patient.setStatus("ADMITTED");
        patientRepository.save(patient);

        // 3. Create Allocation Record
        Allocation allocation = new Allocation();
        allocation.setPatient(patient);
        allocation.setBed(bed);
        allocation.setPriority(patient.getPriority());
        allocation.setAllocationDate(LocalDateTime.now());
        allocation.setStatus("ACTIVE");

        return allocationRepository.save(allocation);
    }

    @Transactional
    public Allocation dischargePatient(Long allocationId) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation record not found with ID: " + allocationId));

        if ("COMPLETED".equalsIgnoreCase(allocation.getStatus())) {
            throw new IllegalStateException("This allocation is already marked as completed (discharged).");
        }

        // 1. Free Bed
        Bed bed = allocation.getBed();
        if (bed != null) {
            bed.setStatus("AVAILABLE");
            bed.setPatient(null);
            bedRepository.save(bed);
        }

        // 2. Mark Patient Discharged
        Patient patient = allocation.getPatient();
        if (patient != null) {
            patient.setStatus("DISCHARGED");
            patientRepository.save(patient);
        }

        // 3. Complete Allocation
        allocation.setStatus("COMPLETED");
        return allocationRepository.save(allocation);
    }
}
