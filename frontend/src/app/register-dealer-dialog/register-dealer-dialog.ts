import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockService } from '../../services/stock.service';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-register-dealer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Angular Material
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './register-dealer-dialog.html',
  styleUrl: './register-dealer-dialog.css'
})
export class RegisterDealerDialog {
  username = "";
  newPassword = "";
  confirmNewPassword = "";
  email = "";
  salesAgent = "CHK";
  dealerCode = "";
  companyName = "";
  changeMessage = "";
  isActive = true;
  phone = "";

  constructor(
      private stockService: StockService,
    public dialogRef: MatDialogRef<RegisterDealerDialog>
  ) { }

  createUser() {
    if (this.confirmNewPassword != this.newPassword) {
      this.changeMessage = 'Password does not match';
      return;
    }

    this.stockService.registerDealer(this.dealerCode, this.companyName, this.username, this.email, this.phone, this.isActive, this.newPassword, this.salesAgent)
      .subscribe(response => {
        if (response.success) {
          this.changeMessage = 'Dealer created successfully!';
          setTimeout(() => this.dialogRef.close(), 500);
        } else {
          this.changeMessage = response.message || 'Failed to create dealer.';
        }
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
