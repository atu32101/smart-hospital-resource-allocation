package com.hospital.dto;

import jakarta.validation.constraints.NotNull;

public class EquipmentAllocationRequest {
    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    public EquipmentAllocationRequest() {
    }

    public EquipmentAllocationRequest(Long equipmentId, Long patientId) {
        this.equipmentId = equipmentId;
        this.patientId = patientId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }
}
