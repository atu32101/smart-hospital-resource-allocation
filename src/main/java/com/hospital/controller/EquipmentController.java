package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.EquipmentAllocationRequest;
import com.hospital.entity.Equipment;
import com.hospital.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin
public class EquipmentController {

    private final EquipmentService equipmentService;

    @Autowired
    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public ResponseEntity<List<Equipment>> getEquipment(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(equipmentService.filterEquipment(type, status));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Equipment>> getAvailableEquipment() {
        return ResponseEntity.ok(equipmentService.getAvailableEquipment());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Equipment>> createEquipment(@Valid @RequestBody Equipment equipment) {
        try {
            Equipment created = equipmentService.createEquipment(equipment);
            return ResponseEntity.ok(ApiResponse.ok("Equipment registered successfully", created));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to add equipment: " + e.getMessage()));
        }
    }

    @PostMapping("/allocate")
    public ResponseEntity<ApiResponse<Equipment>> allocateEquipment(@Valid @RequestBody EquipmentAllocationRequest request) {
        try {
            Equipment allocated = equipmentService.allocateEquipment(request.getEquipmentId(), request.getPatientId());
            String msg = allocated.getName() + " successfully allocated to " + allocated.getPatient().getName() + ".";
            return ResponseEntity.ok(ApiResponse.ok(msg, allocated));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to allocate equipment: " + e.getMessage()));
        }
    }

    @PostMapping("/release/{id}")
    public ResponseEntity<ApiResponse<Equipment>> releaseEquipment(@PathVariable Long id) {
        try {
            Equipment released = equipmentService.releaseEquipment(id);
            return ResponseEntity.ok(ApiResponse.ok(released.getName() + " released and is now Available.", released));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to release equipment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(@PathVariable Long id) {
        try {
            equipmentService.deleteEquipment(id);
            return ResponseEntity.ok(ApiResponse.ok("Equipment deleted successfully."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to delete equipment: " + e.getMessage()));
        }
    }
}
