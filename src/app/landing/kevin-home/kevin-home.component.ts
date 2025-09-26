import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import lottie from 'lottie-web';

@Component({
  selector: 'app-kevin-home',
  templateUrl: './kevin-home.component.html',
  styleUrls: ['./kevin-home.component.scss']
})
export class KevinHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('animationContainer') animationContainer!: ElementRef;

  currentSection = 'home';
  public isCollapsed = true;
  currentYear: number = new Date().getFullYear();
  contactForm: FormGroup;
  isSubmitting = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-zA-Z ]*')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    // Load and play the Lottie animation
    lottie.loadAnimation({
      container: this.animationContainer.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/animations/contact-phone.json'
    });
  }

  // Custom email validator
  emailDomainValidator(control: AbstractControl): {[key: string]: any} | null {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const [_, domain] = email.split('@');
      if (domain && (domain.toLowerCase().includes('spam') || domain.toLowerCase().includes('temp'))) {
        return { 'invalidDomain': true };
      }
    }
    return null;
  }

  // Form field error messages
  getErrorMessage(field: string): string {
    const control = this.contactForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      if (control.errors['email']) return 'Please enter a valid email address';
      if (control.errors['pattern']) {
        if (field === 'mobile') return 'Please enter a valid 10-digit mobile number';
        if (field === 'name') return 'Name should only contain letters and spaces';
      }
      if (control.errors['minlength']) {
        if (field === 'reason') return 'Please provide more details (minimum 10 characters)';
        if (field === 'name') return 'Name should be at least 2 characters long';
      }
      if (control.errors['maxlength']) return 'Maximum 500 characters allowed';
      if (control.errors['invalidDomain']) return 'Please use a valid email domain';
    }
    return '';
  }

  // Show toast notification
  showNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000); // Hide after 5 seconds
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      // Send form data to PHP backend
      this.http.post('/api/contact.php', this.contactForm.value)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            if (response.success) {
              this.showNotification('Thank you for contacting us! We will get back to you soon.', 'success');
              this.contactForm.reset();
            } else {
              this.showNotification(response.message || 'Sorry, there was an error sending your message.', 'error');
            }
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            console.error('Contact form submission error:', error);
          }
        });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
      this.showNotification('Please fix the errors in the form before submitting.', 'error');
    }
  }
}