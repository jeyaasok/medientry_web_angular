import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
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
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // Import DomSanitizer and SafeResourceUrl

// Updated YouTubeVideo interface to include a safe URL for embedding
interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: SafeResourceUrl; // Optional: to store the sanitized embed URL
}

interface AppScreenshot {
  url: string;
  title: string;
  description: string;
}

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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('animationContainer') animationContainer!: ElementRef;
  @ViewChild('howToStartModal') howToStartModal: any;
  @ViewChild('videoContainer') videoContainer!: ElementRef;

  currentSection = 'home';
  public isCollapsed = true;
  currentYear: number = new Date().getFullYear();

  // Property to hold the video currently active in the modal
  activeVideo: YouTubeVideo | null = null;

  // Corrected YouTube video data with proper IDs and thumbnail URLs
  marqueeVideos: YouTubeVideo[] = [];

  youtubeVideos: YouTubeVideo[] = [
    {
      id: 'vGkdpbxeCr4', // Actual YouTube video ID
      title: 'How to Get Started with Medical Form Entry',
      thumbnailUrl: `https://img.youtube.com/vi/vGkdpbxeCr4/hqdefault.jpg` // Correct thumbnail URL
    },
    {
      id: 'vGkdpbxeCr4', // You had the same ID for all; update if these are distinct videos
      title: 'Medical Entry Work Process Explained',
      thumbnailUrl: `https://img.youtube.com/vi/vGkdpbxeCr4/hqdefault.jpg`
    },
    {
      id: 'vGkdpbxeCr4', // You had the same ID for all; update if these are distinct videos
      title: 'Tips for Accurate Medical Data Entry',
      thumbnailUrl: `https://img.youtube.com/vi/vGkdpbxeCr4/hqdefault.jpg`
    },
    {
      id: 'vGkdpbxeCr4', // You had the same ID for all; update if these are distinct videos
      title: 'Earning Potential in Medical Entry Work',
      thumbnailUrl: `https://img.youtube.com/vi/vGkdpbxeCr4/hqdefault.jpg`
    },
    {
      id: 'vGkdpbxeCr4', // You had the same ID for all; update if these are distinct videos
      title: 'Success Stories from Our Members',
      thumbnailUrl: `https://img.youtube.com/vi/vGkdpbxeCr4/hqdefault.jpg`
    }
  ];

  appScreenshots: AppScreenshot[] = [
    {
      url: 'assets/images/gallery/1.png',
      title: 'Dashboard',
      description: 'Your work overview at a glance'
    },
    {
      url: 'assets/images/gallery/2.png',
      title: 'Form Entry',
      description: 'Simple and efficient data entry interface'
    },
    {
      url: 'assets/images/gallery/3.png',
      title: 'Progress Tracking',
      description: 'Monitor your daily achievements'
    },
    {
      url: 'assets/images/gallery/4.png',
      title: 'Payment History',
      description: 'Track your earnings and payments'
    },
    {
      url: 'assets/images/gallery/5.png',
      title: 'Support System',
      description: 'Get help when you need it'
    },
    {
      url: 'assets/images/gallery/6.png',
      title: 'Settings',
      description: 'Customize your work environment'
    }
  ];

  selectedImage: AppScreenshot | null = null;
  contactForm: FormGroup;
  isSubmitting = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Dummy withdrawal data
  withdrawals = [
    { name: 'Ramesh Kumar', amount: 12500 },
    { name: 'Priya Sharma', amount: 18750 },
    { name: 'Arun Singh', amount: 15000 },
    { name: 'Deepa Patel', amount: 11200 },
    { name: 'Suresh Reddy', amount: 19800 },
    { name: 'Meena Kumari', amount: 16400 },
    { name: 'Raj Malhotra', amount: 13700 },
    { name: 'Anita Desai', amount: 17900 },
    { name: 'Vikram Mehta', amount: 14300 },
    { name: 'Sunita Verma', amount: 16800 }
  ];

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
    private modalService: NgbModal,
    private sanitizer: DomSanitizer // Inject DomSanitizer
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern('[a-zA-Z ]*')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email, this.emailDomainValidator]],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  // Remove the @ViewChild('videoCarousel'), scrollPosition, autoScrollInterval,
  // isDragging, startX, scrollLeft properties as they are no longer needed
  // with the new modal-based video player and a simpler flex layout for the carousel.

  // The methods related to auto-scrolling and manual scrolling of the video carousel
  // (startAutoScroll, stopAutoScroll, onMouseDown, onMouseMove, onMouseUp, onMouseLeave)
  // are also removed as they are not relevant to the new implementation.

  ngOnInit(): void {
    // No need to set marqueeVideos, we'll use youtubeVideos directly in the template
  }

  ngOnDestroy(): void {
    // if (this.autoScrollInterval) { // No longer needed
    //   clearInterval(this.autoScrollInterval);
    // }
  }

  // Open Terms & Conditions modal
  openTermsConditions() {
    this.modalService.open(TermsConditionsComponent, {
      size: 'lg',
      centered: true,
      scrollable: true
    });
  }

  // Open Privacy Policy modal
  openPrivacyPolicy() {
    this.modalService.open(PrivacyPolicyComponent, {
      size: 'lg',
      centered: true,
      scrollable: true
    });
  }

  /**
   * This function runs when you click a video.
   * It creates the safe URL and sets `activeVideo` to show the modal.
   */
  playVideo(video: YouTubeVideo): void {
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
    video.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.activeVideo = video;
  }

  /**
   * This function runs when you click the backdrop or close button.
   * It hides the modal by clearing `activeVideo`.
   */
  closeModal(): void {
    this.activeVideo = null;
  }

  // Gallery modal controls
  openImageModal(image: AppScreenshot): void {
    this.selectedImage = image;
  }

  closeImageModal(): void {
    this.selectedImage = null;
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