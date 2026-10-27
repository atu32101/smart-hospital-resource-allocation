package com.hospital.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class AllocationRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    private List<Long> equipmentIds;

    public AllocationRequest() {
    }

    public AllocationRequest(Long patientId, Long bedId) {
        this.patientId = patientId;
        this.bedId = bedId;
    }

    public AllocationRequest(Long patientId, Long bedId, List<Long> equipmentIds) {
        this.patientId = patientId;
        this.bedId = bedId;
        this.equipmentIds = equipmentIds;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public List<Long> getEquipmentIds() {
        return equipmentIds;
    }

    public void setEquipmentIds(List<Long> equipmentIds) {
        this.equipmentIds = equipmentIds;
    }
}
