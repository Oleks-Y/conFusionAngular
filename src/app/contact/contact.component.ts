import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';
import { baseURL } from '../shared/baseurl';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host : {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations:[
    flyInOut(),
    expand()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackcopy: Feedback;
  contactType= ContactType;
  wait: Boolean = false;
  showSubmit: Boolean = false;
  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname' : '',
    'lastname': '',
    'telnum' : '',
    'email': ''
  };

  validationMessage = {
    'firstname': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.',
      'maxlength':     'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required':      'Last Name is required.',
      'minlength':     'Last Name must be at least 2 characters long.',
      'maxlength':     'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required':      'Tel. number is required.',
      'pattern':       'Tel. number must contain only numbers.'
    },
    'email': {
      'required':      'Email is required.',
      'email':         'Email not in valid format.'
    },
  };

  constructor(private fb: FormBuilder,
    private feedbackService: FeedbackService) { 
    this.createForm();
  }

  ngOnInit() {
  }

  createForm(){
    this.feedbackForm= this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ['', [Validators.required , Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges.subscribe(data=>this.onValueChanged(data));

    this.onValueChanged();
  }
  onValueChanged(data?: string): void {
    if (!this.feedbackForm){return;}
    const form = this.feedbackForm;
    for(const field in this.formErrors){
        if(this.formErrors.hasOwnProperty(field)){
          this.formErrors[field]="";
          const control = form.get(field);
          if(control && control.dirty && !control.valid){
            const messages = this.validationMessage[field];
            for (const key in control.errors){
              if(control.errors.hasOwnProperty(key)){
                this.formErrors[field] +=messages[key] + ' ';
              }
            }
          }
        }
    }
  }

  onSubmit(){
    this.feedback=this.feedbackForm.value;
    this.wait=true;
    this.feedbackService.postContact(this.feedback)
    .subscribe(feedback=>{
      this.feedback = feedback; this.feedbackcopy=feedback;
      this.wait=false,
      this.showSubmit=true
    },
    errmess=> {this.feedback= null; console.log(<any>errmess)}
    );
    console.log(this.feedback);
    setTimeout(function(){
      this.showSubmit=false
    }.bind(this), 5000)
    
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: '',
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.feedbackFormDirective.resetForm();
  }

}
