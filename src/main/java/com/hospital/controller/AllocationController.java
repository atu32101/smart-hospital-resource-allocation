package com.hospital.controller;

import com.hospital.dto.AllocationRequest;
import com.hospital.dto.ApiResponse;
import com.hospital.dto.RecommendationResponse;
import com.hospital.entity.Allocation;
import com.hospital.service.AllocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@CrossOrigin
public class AllocationController {

    private final AllocationService allocationService;

    @Autowired
    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping("/api/allocations")
    public ResponseEntity<List<Allocation>> getAllAllocations() {
        return ResponseEntity.ok(allocationService.getAllAllocations());
    }

    @PostMapping("/api/allocation/recommend/{patientId}")
    public ResponseEntity<RecommendationResponse> recommendBed(@PathVariable Long patientId) {
        try {
            RecommendationResponse response = allocationService.recommendBed(patientId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new RecommendationResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new RecommendationResponse(false, "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/api/allocation/accept")
    public ResponseEntity<ApiResponse<Allocation>> acceptAllocation(@Valid @RequestBody AllocationRequest request) {
        try {
            Allocation allocation = allocationService.acceptAllocation(request.getPatientId(), request.getBedId());
            String msg = "Bed " + allocation.getBed().getBedNumber() + " successfully allocated to " + allocation.getPatient().getName() + ".";
            return ResponseEntity.ok(ApiResponse.ok(msg, allocation));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to allocate bed: " + e.getMessage()));
        }
    }

    @PostMapping("/api/allocation/discharge/{allocationId}")
    public ResponseEntity<ApiResponse<Allocation>> dischargePatient(@PathVariable Long allocationId) {
        try {
            Allocation completed = allocationService.dischargePatient(allocationId);
            String bedNum = completed.getBed() != null ? completed.getBed().getBedNumber() : "Bed";
            String patientName = completed.getPatient() != null ? completed.getPatient().getName() : "Patient";
            String msg = patientName + " discharged successfully. Bed " + bedNum + " is now Available.";
            return ResponseEntity.ok(ApiResponse.ok(msg, completed));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to discharge patient: " + e.getMessage()));
        }
    }
}
