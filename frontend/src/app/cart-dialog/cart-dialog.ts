import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogRef, MatDialogActions } from "@angular/material/dialog";
import { MaterialModule } from '../shared/material.module';
import { FormBuilder } from '@angular/forms';
import { LensoItem } from '../models/lenso_item';

@Component({
  selector: 'app-cart-dialog',
  imports: [MatDialogContent, MaterialModule, MatDialogActions],
  templateUrl: './cart-dialog.html',
  styleUrl: './cart-dialog.css'
})
export class CartDialog implements OnInit {
  // backendLink = "https://98j88mtl-3000.asse.devtunnels.ms";
  backendLink = "https://mcq5cp7n-3004.asse.devtunnels.ms";
  // backendLink = "http://localhost:3000";

  salesAgentInfoList: any[] = [
    { name: 'CHK', phone: '60123019232' },
    { name: 'LKY', phone: '60125206232' },
    { name: 'LSY', phone: '60124406232' },
    { name: 'SKW', phone: '60122808232' },
    { name: 'KKK', phone: '60123906232' },
    { name: 'HKJ', phone: '60129845232' },
    { name: 'LSK', phone: '60122072966' },
  ]

  cartItemList: LensoItem[] = [];

  constructor(
    public dialogRef: MatDialogRef<CartDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.cartItemList = this.data.selectedItems;
  }

  whatsAppContact() {
    const phoneNumber = this.salesAgentInfoList.find(agent => agent.name === this.data.salesAgent)?.phone || '60123906232';
    const items = this.cartItemList
      .map((item, index) => {
        return `${index + 1}. ${item.Description} (${item.ItemCode}) - Qty: ${item.CartQty}`;
      }).join('\n');

    const message = `Hi, I would like to order/enquire about the following items:\n\n${items}`;

    // console.log(message);

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  deleteItem(item: LensoItem) {
    item.CartQty = 0;
  }

  changeItemCartQty(item: LensoItem, isAdd: boolean) {
    if (isAdd) {
      item.CartQty++;
    } else if (item.CartQty > -1) {
      item.CartQty--;
    }
  }

  onImgLoad(event: Event, item: any) {
    item.imageLoaded = true;
    item.imageExist = true;
    if ((event.target as HTMLImageElement).src.includes('image-not-found.png')) {
      item.imageExist = false;
    }
    this.cd.detectChanges();
  }

  onImgError(event: Event, item: any) {
    item.imageLoaded = true;
    (event.target as HTMLImageElement).src = 'assets/image-not-found.png';
    const el = event.target as HTMLElement;
    el.style.userSelect = 'none';
    (el.style as any).webkitUserSelect = 'none';
    (el.style as any).msUserSelect = 'none';
    (el.style as any).MozUserSelect = 'none';
  }

  removeItem(item: LensoItem) {
    item.CartQty = 0;
    item.RemovedFromCart = true;
  }

  closeDialog() {
    this.dialogRef.close(this.cartItemList);
  }
}
