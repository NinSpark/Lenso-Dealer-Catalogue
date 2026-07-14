import { ChangeDetectorRef, Component, OnInit, ViewChild, PLATFORM_ID, Inject, ElementRef, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormControl } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { LensoStock } from '../models/lenso_stock';
import { LensoItem } from '../models/lenso_item';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { LensoPrice } from '../models/lenso_price';
import jsPDF from 'jspdf';
import { MaterialModule } from '../shared/material.module';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../services/auth.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MaterialModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  animations: [
    trigger('cardAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class Home implements OnInit {
  // backendLink = "https://98j88mtl-3000.asse.devtunnels.ms";
  // backendLink = "https://mcq5cp7n-3002.asse.devtunnels.ms";
  backendLink = "http://localhost:3000";

  isLoading: boolean = false;
  isLoadingShare: boolean = false;
  isLensoDB: boolean = true;
  isStockCountReady: boolean = false;
  fullStockCount: number = 0;
  emptyStockCount: number = 0;
  isInitial: boolean = true;

  @ViewChild('searchbar') searchbar!: ElementRef;
  searchRimText = '';
  private searchSubject = new Subject<string>();
  private searchSub: any;
  shareMsg: string = '';

  fullStockList: LensoStock[] = [];
  fullItemList = new MatTableDataSource<LensoItem>();
  isSet: boolean = true;
  showCost: boolean = false;
  showPrice: boolean = true;
  showOOS: boolean = false;
  isMobileView: boolean = true;
  isTabletView: boolean = false;
  showBackToTop: boolean = false;
  currentSort: string = 'newest';
  hidePriceOption: boolean = false;

  selectedSize = new FormControl<string[]>([]);
  selectedPCD = new FormControl<string[]>([]);
  selectedType: string = "all-type";
  selectedSeries: string[] = [];

  loadingMap: { [itemCode: string]: boolean } = {};
  selectedItems: LensoItem[] = [];

  sizeList: any[] = [
    { name: '15"', value: '15' },
    { name: '16"', value: '16' },
    { name: '17"', value: '17' },
    { name: '18"', value: '18' },
    { name: '19"', value: '19' },
    { name: '20"', value: '20' },
    { name: '22"', value: '22' }
  ];

  pcdList: any[] = [];

  private _sort!: MatSort;

  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    this._sort = sort;
    if (this.fullItemList) {
      this.fullItemList.sort = sort;
    }
  }

  constructor(
    private authService: AuthService,
    private stockService: StockService,
    private router: Router,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    { nativeElement }: ElementRef<HTMLImageElement>
  ) {
    const supports = 'loading' in HTMLImageElement.prototype;

    if (supports) {
      nativeElement.setAttribute('loading', 'lazy');
    }
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.shareMsg = "Initializing Database...";
    this.isLoadingShare = true;

    if (isPlatformBrowser(this.platformId)) {
      this.checkScreen();
      window.addEventListener('resize', this.checkScreen.bind(this));
    }

    if (this.authService.getLoggedInUser() == "KSEM-ADMIN") {
      this.showPrice = false;
      this.hidePriceOption = true;
    }

    this.getPCDList();
    this.isLoadingShare = false;
    this.shareMsg = "";

    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(600)
      )
      .subscribe((searchValue) => {
        this.applyFilter();
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop = scrollPosition > 400;
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  trackByItemCode(item: any): string {
    return item.ItemCode;
  }

  async getPCDList(): Promise<void> {
    this.stockService.getPCDList().subscribe({
      next: (data: any[]) => {
        if (data.length > 0) {
          this.pcdList = [];
          data.forEach(pcd => {
            this.pcdList.push({
              name: pcd.Description,
              value: pcd.ItemCategory
            });
          });

          this.initializeFilter();
        }
      },
      error: (error) => {
        console.error('Error fetching PCDs:', error);
        this.setLoading(false);
      }
    });
  }

  checkScreen() {
    const width = window.innerWidth;
    this.isMobileView = width <= 600;
    this.isTabletView = width > 600 && width <= 1024;
  }

  sortBy(criteria: string) {
    this.currentSort = criteria;
    this.applySort();
  }

  applySort() {
    if (this.fullItemList.data.length == 0 || !this.currentSort) return;

    switch (this.currentSort) {
      case 'az':
        this.fullItemList.data.sort((a, b) => a.Description.localeCompare(b.Description));
        break;
      case 'za':
        this.fullItemList.data.sort((a, b) => b.Description.localeCompare(a.Description));
        break;
      case 'newest':
        this.fullItemList.data.sort((a, b) => b.ItemCode.localeCompare(a.ItemCode));
        break;
      case 'oldest':
        this.fullItemList.data.sort((a, b) => a.ItemCode.localeCompare(b.ItemCode));
        break;
      case 'priceHigh':
        this.fullItemList.data.sort((a, b) => {
          const aPrice = (a.Price != null && a.Price >= 0) ? a.Price : -Infinity;
          const bPrice = (b.Price != null && b.Price >= 0) ? b.Price : -Infinity;
          return bPrice - aPrice;
        });
        break;
      case 'priceLow':
        this.fullItemList.data.sort((a, b) => {
          const aPrice = (a.Price != null && a.Price >= 0) ? a.Price : Infinity;
          const bPrice = (b.Price != null && b.Price >= 0) ? b.Price : Infinity;
          return aPrice - bPrice;
        });
        break;
      case 'qtyHigh':
        this.fullItemList.data.sort((a, b) => b.StockQty - a.StockQty);
        break;
      case 'qtyLow':
        this.fullItemList.data.sort((a, b) => a.StockQty - b.StockQty);
        break;
      case 'heaviest':
        this.fullItemList.data.sort((a, b) => {
          const aWeight = (a.Weight && a.Weight > 0) ? a.Weight : -Infinity;
          const bWeight = (b.Weight && b.Weight > 0) ? b.Weight : -Infinity;
          return bWeight - aWeight;
        });
        break;
      case 'lightest':
        this.fullItemList.data.sort((a, b) => {
          const aWeight = (a.Weight && a.Weight > 0) ? a.Weight : Infinity;
          const bWeight = (b.Weight && b.Weight > 0) ? b.Weight : Infinity;
          return aWeight - bWeight;
        });
        break;
    }
  }

  resetFilters(): void {
    this.selectedType = 'all-type';
    this.selectedSize.setValue(['all-size', ...this.sizeList.map(size => size.value)]);
    this.selectedPCD.setValue(['all-pcd', ...this.pcdList.map(pcd => pcd.value)]);
    this.showCost = false;
    this.showPrice = true;
    this.isSet = true;
    this.showOOS = false;
    this.searchRimText = '';

    this.applyFilter();
  }

  clearList(): void {
    this.isInitial = true;
    this.selectedType = 'all-type';
    this.selectedSize.setValue(['all-size', ...this.sizeList.map(size => size.value)]);
    this.selectedPCD.setValue(['all-pcd', ...this.pcdList.map(pcd => pcd.value)]);
    this.showCost = false;
    this.showPrice = false;
    this.isSet = false;
    this.showOOS = false;
    this.searchRimText = '';

    this.fullItemList.data = [];
  }

  toggleCard(item: LensoItem) {
    const index = this.selectedItems.indexOf(item);
    if (index >= 0) {
      this.selectedItems.splice(index, 1);
    } else {
      if (item.imageExist) this.selectedItems.push(item);
    }
  }

  isSelected(item: LensoItem): boolean {
    return this.selectedItems.includes(item);
  }

  async fetchPriceAndWeight(): Promise<void> {
    try {
      this.stockService.getPriceList(this.isLensoDB).subscribe((data: LensoPrice[]) => {
        this.fullItemList.data.forEach((item: LensoItem) => {
          let price = data.find((itemPrice) => itemPrice.ItemCode == item.ItemCode)?.Price;
          if (price) {
            item.Price = price;
          }
          else {
            item.Price = -1;
          }

          let weight = data.find((itemWeight) => itemWeight.ItemCode == item.ItemCode)?.Weight;
          if (weight) {
            item.Weight = weight;
          }
          else {
            item.Weight = -1;
          }
        });

        this.fetchStocks();
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }

  async fetchStocks(): Promise<void> {
    try {
      this.stockService.getStockList(this.isLensoDB).subscribe((data: LensoStock[]) => {
        this.fullStockList = data;

        this.fullItemList.data.forEach((item: LensoItem) => {
          item.StockQty = 0;
          item.Cost = 0;

          let currentItemList = this.fullStockList.filter((stock: LensoStock) => stock.ItemCode === item.ItemCode);
          currentItemList.forEach((currentItem) => {
            item.StockQty += currentItem.Qty;
          });

          if (currentItemList.length > 0) {
            item.Cost = currentItemList[0].Cost;
          }
        });

        this.applySort();
        this.fullStockCount = this.inStockCount();
        this.emptyStockCount = this.fullItemList.data.length - this.fullStockCount;
        this.isStockCountReady = true;
      });
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  }

  initializeFilter() {
    this.selectedSize.setValue(['all-size', ...this.sizeList.map(size => size.value)]);
    this.selectedPCD.setValue(['all-pcd', ...this.pcdList.map(pcd => pcd.value)]);
  }

  calculateSet(value: number): number {
    return Math.floor(value / 4);
  }

  inStockCount() {
    return this.fullItemList.data.filter(item => item.StockQty > 0).length;
  }

  toggleAllSize(event: any) {
    if (event._selected) {
      this.selectedSize.setValue(this.sizeList.map(size => size.value));
      event._selected = true;
    }
    else {
      this.selectedSize.setValue([]);
    }
  }

  getSelectedSizeText(): string {
    const values: string[] = this.selectedSize.value || [];
    const actualValues = values.filter(v => v !== 'all-size');

    if (actualValues.length === this.sizeList.length) {
      return 'All Sizes';
    }

    return this.sizeList
      .filter(size => actualValues.includes(size.value))
      .map(size => size.name)
      .join(', ');
  }

  toggleAllPCD(event: any) {
    if (event._selected) {
      this.selectedPCD.setValue(this.pcdList.map(pcd => pcd.value));
      event._selected = true;
    }
    else {
      this.selectedPCD.setValue([]);
    }
  }

  getSelectedPCDText(): string {
    const values: string[] = this.selectedPCD.value || [];
    const actualValues = values.filter(v => v !== 'all-pcd');

    if (actualValues.length === this.pcdList.length) {
      return 'All PCDs';
    }

    return this.pcdList
      .filter(pcd => actualValues.includes(pcd.value))
      .map(pcd => pcd.name)
      .join(', ');
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
    if (loading) {
      this.selectedSize.disable();
    } else {
      this.selectedSize.enable();
    }
  }

  async applyFilter() {
    // this.isLoading = true;
    this.isInitial = false;
    this.setLoading(true);
    this.isStockCountReady = false;
    this.fullStockCount = 0;
    this.emptyStockCount = 0;
    this.fullItemList.data = [];
    let selectedSizes: string[] = this.selectedSize.value || [];
    let selectedPCDs: string[] = this.selectedPCD.value || [];
    let selectedType: string = this.selectedType;
    let search: string = this.searchRimText.trim() || '';

    this.selectedItems = [];
    const pcdIndex = selectedPCDs.indexOf("all-pcd");
    const sizeIndex = selectedSizes.indexOf("all-size");

    if (pcdIndex > -1) {
      selectedPCDs.splice(pcdIndex, 1);
    }
    if (sizeIndex > -1) {
      selectedSizes.splice(sizeIndex, 1);
    }

    this.stockService
      .getFilteredItem(selectedType, selectedSizes, selectedPCDs, this.isLensoDB, search)
      .subscribe({
        next: (data: LensoItem[]) => {
          this.fullItemList.data = data;
          this.fetchPriceAndWeight();
          // console.log(this.fullItemList.data);
        },
        error: (error) => {
          console.error('Error during filtering:', error);
          // this.isLoading = false;
          this.setLoading(false);
        },
        complete: () => {
          // this.isLoading = false;
          this.setLoading(false);
        }
      });
  }

  selectAll() {
    if (this.selectedItems.length > 0) {
      this.selectedItems = [];
      return;
    }

    var itemsToSelect: LensoItem[] = this.fullItemList.data;
    if (!this.showOOS) itemsToSelect = itemsToSelect.filter((item: LensoItem) => item.StockQty > 0);

    itemsToSelect.forEach((item: LensoItem) => {
      this.selectedItems.push(item);
    });
  }

  async shareSelectedImages() {
    this.shareMsg = "Compiling Images...";
    this.isLoadingShare = true;
    const imageFiles: File[] = [];
    var count: number = 0;

    for (const item of this.selectedItems) {
      this.shareMsg = `Rendering ${item.Description}... (${count}/${this.selectedItems.length})`;
      const imageUrl = `${this.backendLink}/images/png/${item.ItemCode}.png`;

      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        const fileName = `${item.ItemCode}.png`;
        const file = new File([blob], fileName, { type: blob.type || 'image/png' });

        imageFiles.push(file);
      } catch (err) {
        console.error('Failed to fetch image:', imageUrl, err);
      }

      count++;
    }

    if (imageFiles.length > 0 && navigator.canShare && navigator.canShare({ files: imageFiles })) {
      try {
        await navigator.share({
          title: '',
          text: '',
          files: imageFiles,
        });
      } catch (err) {
        console.error('Sharing failed:', err);
      }
    } else {
      alert('Web Share API is not supported or cannot share these files.');
    }

    this.isLoadingShare = false;
    this.shareMsg = "";
  }

  async exportToPDF() {
    this.shareMsg = "Exporting to PDF...";
    this.isLoadingShare = true;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 4;
    const marginY = 4;
    const gutterX = 4;
    const gutterY = 4;
    const imgWidth = (pageWidth - marginX * 2 - gutterX) / 2;
    const imgHeight = (pageHeight - marginY * 2 - gutterY * 3) / 4;
    const maxItemsPerPage = 8;

    const imagePromises = this.selectedItems.map(async (item) => {
      const imgSrc = `${this.backendLink}/images/webp/${item.ItemCode}.webp`;
      try {
        return {
          item,
          imgEl: await this.getImageElement(imgSrc),
        };
      } catch {
        return null; // skip missing images
      }
    });

    const loadedImages = (await Promise.all(imagePromises))
      .filter((img): img is { item: LensoItem; imgEl: HTMLImageElement } => img !== null);

    let x = marginX;
    let y = marginY;
    let itemsOnPage = 0;

    for (let i = 0; i < loadedImages.length; i++) {
      const { item, imgEl } = loadedImages[i];
      this.shareMsg = `Rendering ${item.Description}... (${i}/${loadedImages.length})`;
      await new Promise(resolve => setTimeout(resolve, 0));

      try {
        const naturalWidth = imgEl.naturalWidth;
        const naturalHeight = imgEl.naturalHeight;

        const scale = Math.min(imgWidth / naturalWidth, imgHeight / naturalHeight);

        const drawWidth = naturalWidth * scale;
        const drawHeight = naturalHeight * scale;

        const offsetX = x + (imgWidth - drawWidth) / 2;
        const offsetY = y + (imgHeight - drawHeight) / 2;

        doc.addImage(imgEl, 'WEBP', offsetX, offsetY, drawWidth, drawHeight, undefined, 'FAST');
      } catch (err) {
        console.error('Error adding image to PDF:', item.ItemCode, err);
      }

      if (x === marginX) {
        x += imgWidth + gutterX;
      } else {
        x = marginX;
        y += imgHeight + gutterY;
      }

      itemsOnPage++;

      if (itemsOnPage === maxItemsPerPage && i < loadedImages.length - 1) {
        doc.addPage();
        x = marginX;
        y = marginY;
        itemsOnPage = 0;
      }
    }

    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], 'lenso-selected-wheel-catalogue.pdf', { type: 'application/pdf' });

    if (this.isMobileView || this.isTabletView) {
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            title: 'Selected Wheels PDF',
            files: [pdfFile],
          });
        } catch (err) {
          console.error('Sharing failed:', err);
        }
      } else {
        const blobUrl = doc.output('bloburl');
        window.open(blobUrl, '_blank');
      }
    } else {
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    }

    this.isLoadingShare = false;
    this.shareMsg = "";
  }

  private async getBase64FromUrl(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${url} (${res.status})`);
    }
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  private async getImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
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
}