package ru.spb.bezbab.frmap.backend.controllers;

import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e) {
        Map<String, String> response = new HashMap<>();
        response.put("error", e.getMessage());
        return ResponseEntity
                .status(500)
                .body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException e) {
        Map<String, String> response = new HashMap<>();
        response.put("error", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Validation failed");
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
}