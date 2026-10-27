package com.hospital.dto;

public class DashboardStatsResponse {
    private long totalPatients;
    private long admittedPatients;
    private long waitingPatients;
    private long dischargedPatients;

    private long totalBeds;
    private long availableBeds;
    private long occupiedBeds;

    // Equipment breakdown
    private long totalEquipment;
    private long availableEquipment;
    private long allocatedEquipment;

    // Bed breakdown
    private long generalAvailable;
    private long generalOccupied;
    private long privateAvailable;
    private long privateOccupied;
    private long icuAvailable;
    private long icuOccupied;

    // Patient priority breakdown
    private long criticalCount;
    private long highCount;
    private long mediumCount;
    private long lowCount;

    public DashboardStatsResponse() {
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getAdmittedPatients() {
        return admittedPatients;
    }

    public void setAdmittedPatients(long admittedPatients) {
        this.admittedPatients = admittedPatients;
    }

    public long getWaitingPatients() {
        return waitingPatients;
    }

    public void setWaitingPatients(long waitingPatients) {
        this.waitingPatients = waitingPatients;
    }

    public long getDischargedPatients() {
        return dischargedPatients;
    }

    public void setDischargedPatients(long dischargedPatients) {
        this.dischargedPatients = dischargedPatients;
    }

    public long getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(long totalBeds) {
        this.totalBeds = totalBeds;
    }

    public long getAvailableBeds() {
        return availableBeds;
    }

    public void setAvailableBeds(long availableBeds) {
        this.availableBeds = availableBeds;
    }

    public long getOccupiedBeds() {
        return occupiedBeds;
    }

    public void setOccupiedBeds(long occupiedBeds) {
        this.occupiedBeds = occupiedBeds;
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getAvailableEquipment() {
        return availableEquipment;
    }

    public void setAvailableEquipment(long availableEquipment) {
        this.availableEquipment = availableEquipment;
    }

    public long getAllocatedEquipment() {
        return allocatedEquipment;
    }

    public void setAllocatedEquipment(long allocatedEquipment) {
        this.allocatedEquipment = allocatedEquipment;
    }

    public long getGeneralAvailable() {
        return generalAvailable;
    }

    public void setGeneralAvailable(long generalAvailable) {
        this.generalAvailable = generalAvailable;
    }

    public long getGeneralOccupied() {
        return generalOccupied;
    }

    public void setGeneralOccupied(long generalOccupied) {
        this.generalOccupied = generalOccupied;
    }

    public long getPrivateAvailable() {
        return privateAvailable;
    }

    public void setPrivateAvailable(long privateAvailable) {
        this.privateAvailable = privateAvailable;
    }

    public long getPrivateOccupied() {
        return privateOccupied;
    }

    public void setPrivateOccupied(long privateOccupied) {
        this.privateOccupied = privateOccupied;
    }

    public long getIcuAvailable() {
        return icuAvailable;
    }

    public void setIcuAvailable(long icuAvailable) {
        this.icuAvailable = icuAvailable;
    }

    public long getIcuOccupied() {
        return icuOccupied;
    }

    public void setIcuOccupied(long icuOccupied) {
        this.icuOccupied = icuOccupied;
    }

    public long getCriticalCount() {
        return criticalCount;
    }

    public void setCriticalCount(long criticalCount) {
        this.criticalCount = criticalCount;
    }

    public long getHighCount() {
        return highCount;
    }

    public void setHighCount(long highCount) {
        this.highCount = highCount;
    }

    public long getMediumCount() {
        return mediumCount;
    }

    public void setMediumCount(long mediumCount) {
        this.mediumCount = mediumCount;
    }

    public long getLowCount() {
        return lowCount;
    }

    public void setLowCount(long lowCount) {
        this.lowCount = lowCount;
    }
}
