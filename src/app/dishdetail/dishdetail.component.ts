import { Component, OnInit, Input, ViewChild , Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import {Params, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {DishService} from '../services/dish.service';
import {switchMap} from 'rxjs/operators';
import { DISHES } from '../shared/dishes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '@angular/compiler';
import {trigger, state, style, animate, transition} from '@angular/animations';
import { visibility } from '../animations/app.animation';
import { flyInOut, expand } from '../animations/app.animation';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host : {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations:[
    flyInOut(),
    visibility(),
    expand()
  ]
  
})
export class DishdetailComponent implements OnInit {

  dish: Dish; 
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  currentComment: Comment;
  @ViewChild('fform') feedbackFormDirective;
  @ViewChild('slider') slider;
  dishcopy : Dish;
  visibility = "shown";

  formErrors = {
    'author': '',
    'comment':''
  }; 

  validationMessage={
    'author':{
      'required':'Name is required.',
      'minlength':'Name must be at least 2 characters long.',
      'maxlength':'Name cannot be more than 25 characters long.'
    },
    'comment':{
      'required': 'Comment is required.'
    }
  }

  commentForm: FormGroup;
  comment: Comment;

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) 
    { 
      
    }
    
    

  ngOnInit() {
    this.createForm();

    this.dishService.getDishIds()
      .subscribe(dishIds=> this.dishIds = dishIds);
     this.route.params
     .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(params['id']); }))
      .subscribe(dish=> {this.dish=dish; this.dishcopy=dish; this.setPrevNext(dish.id); this.visibility="shown"},
      errmess=> this.errMess =<any>errmess);

      
    }

    setPrevNext(dishId: string ){
      const index = this.dishIds.indexOf(dishId);
      this.prev= this.dishIds[( this.dishIds.length+ index-1)%this.dishIds.length];
      this.next= this.dishIds[( this.dishIds.length+ index+1)%this.dishIds.length];
    }

    goBack(): void{
      this.location.back();
    }

    createForm(){
      this.commentForm = this.fb.group({
        rating: ['', Validators.required],
        comment: ['',[ Validators.required ]],
        author: ['', [ Validators.required, Validators.minLength(2), Validators.maxLength(25) ]],        
      });

      this.commentForm.valueChanges.subscribe(data=> this.onValueChanged(data));

      this.onValueChanged()
    }
    onSubmit(){
      this.commentForm.value["date"] = Date.now();
      this.dishcopy.comments.push(this.commentForm.value); 
      this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
      this.commentForm.reset({
        rating: '',
        comment: '',
        author: '',
        date: ''
      })   
    }
  onValueChanged(data?: string): void {
    if(!this.commentForm) {return ;}
    const form = this.commentForm;
    for(const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        this.formErrors[field]='';
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
    this.currentComment = this.commentForm.value;
  }

 
}
}
