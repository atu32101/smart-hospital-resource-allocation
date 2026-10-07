package com.hospital.service;

import com.hospital.dto.LoginRequest;
import com.hospital.dto.LoginResponse;
import com.hospital.entity.User;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse authenticate(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return new LoginResponse(false, "Username and password cannot be empty", null, null);
        }

        Optional<User> userOpt = userRepository.findByUsername(request.getUsername().trim());
        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "Invalid username or password", null, null);
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(request.getPassword().trim())) {
            return new LoginResponse(false, "Invalid username or password", null, null);
        }

        return new LoginResponse(true, "Login successful", user.getUsername(), user.getRole());
    }
}
