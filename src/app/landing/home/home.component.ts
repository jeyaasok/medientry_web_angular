import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbToastModule, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CdkAccordionModule } from '@angular/cdk/accordion';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbCollapseModule,
        NgbToastModule,
        NgbModalModule,
        ScrollToModule,
        SharedModule,
        RouterModule,
        CdkAccordionModule
    ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('animationContainer') animationContainer!: ElementRef;
  @ViewChild('howToStartModal') howToStartModal: any;
  
  currentSection = 'home';
  public isCollapsed = true;
  currentYear: number = new Date().getFullYear();
  contactForm: FormGroup;
  isSubmitting = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  faqs = [
    {
      id: 1,
      question: 'What is the payment structure for form entry?',
      expanded: true
    },
    {
      id: 2,
      question: 'How long does it take to complete one slot?',
      expanded: false
    },
    {
      id: 3,
      question: 'When and how do I receive payments?',
      expanded: false
    },
    {
      id: 4,
      question: 'What happens if I miss the slot deadline?',
      expanded: false
    },
    {
      id: 5,
      question: 'Is there a minimum amount for withdrawal?',
      expanded: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal
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

  // Open How to Start Modal
  openHowToStartModal() {
    this.modalService.open(this.howToStartModal, { 
      size: 'lg',
      centered: true,
      scrollable: true
    });
  }

  ngAfterViewInit() {
    // The dotlottie-wc web component will handle the animation automatically
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
  showNotification(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000); // Hide after 5 seconds
  }

  onSubmit() {
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

  /**
   * Section changed method
   * @param sectionId specify the current sectionID
   */
  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  /**
   * Window scroll method
   */
  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
      navbar?.classList.add('is-sticky');
    }
    else {
      navbar?.classList.remove('is-sticky');
    }

    // Top Btn Set
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      (document.getElementById("back-to-top") as HTMLElement).style.display = "block"
    } else {
      (document.getElementById("back-to-top") as HTMLElement).style.display = "none"
    }
  }

  // When the user clicks on the button, scroll to the top of the document
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
}