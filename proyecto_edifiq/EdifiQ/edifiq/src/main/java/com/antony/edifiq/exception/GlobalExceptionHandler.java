package com.antony.edifiq.exception;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
 private static final String ERROR_KEY = "error";
 @ExceptionHandler(IllegalArgumentException.class)
 public ResponseEntity<Map<String,String>> badRequest(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of(ERROR_KEY,e.getMessage()));}
 @ExceptionHandler(IllegalStateException.class)
 public ResponseEntity<Map<String,String>> serviceConfiguration(IllegalStateException e){return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(ERROR_KEY,e.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<Map<String,String>> validation(MethodArgumentNotValidException e){
   Map<String,String> errors=new LinkedHashMap<>();
   e.getBindingResult().getFieldErrors().forEach(x->errors.put(x.getField(),x.getDefaultMessage()));
   return ResponseEntity.badRequest().body(errors);
 }
 @ExceptionHandler(Exception.class)
 public ResponseEntity<Map<String,String>> general(Exception e){return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(ERROR_KEY,"Ocurrió un error interno en el servidor"));}
}
