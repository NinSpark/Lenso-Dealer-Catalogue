import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule
  ],
  declarations: [],
  bootstrap: [],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
  ],
})
export class AppModule { }

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
