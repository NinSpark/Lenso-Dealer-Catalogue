import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StockService {
    private domain = "http://localhost:3000";
    // private domain = "https://mcq5cp7n-3002.asse.devtunnels.ms";
    // private domain = "https://hbctrlpd-3000.asse.devtunnels.ms";

    private itemApiUrl = `${this.domain}/api/item`;
    private itemPCDUrl = `${this.domain}/api/item-category`;
    private filteredItemApiUrl = `${this.domain}/api/filtered-item`;
    private stockApiUrl = `${this.domain}/api/stock`;
    private priceApiUrl = `${this.domain}/api/item-price`;
    private getSecuredLoginUrl = `${this.domain}/secured-sales-login`;

    constructor(private http: HttpClient) { }

    getSecuredLoginDetails(username: string, password: string) {
        const body = { username, password };
        return this.http.post<any>(this.getSecuredLoginUrl, body);
    }

    getItemList(isLensoDB?: boolean): Observable<any[]> {
        const dbParam = isLensoDB ? 'lenso' : 'kai_shen';
        const url = `${this.itemApiUrl}?db=${dbParam}`;
        return this.http.get<any[]>(url);
    }

    getPCDList(): Observable<any[]> {
        const url = `${this.itemPCDUrl}?db=lenso`;
        return this.http.get<any[]>(url);
    }

    getStockList(isLensoDB?: boolean): Observable<any[]> {
        const dbParam = isLensoDB ? 'lenso' : 'kai_shen';
        const url = `${this.stockApiUrl}?db=${dbParam}`;
        return this.http.get<any[]>(url);
    }

    getPriceList(isLensoDB?: boolean): Observable<any[]> {
        const dbParam = isLensoDB ? 'lenso' : 'kai_shen';
        const url = `${this.priceApiUrl}?db=${dbParam}`;
        return this.http.get<any[]>(url);
    }

    getFilteredItem(type: string, size: string[], pcd: string[], isLensoDB: boolean, search?: string) {
        const dbParam = isLensoDB ? 'lenso' : 'kai_shen';

        let params: any = {
            type,
            pcd: JSON.stringify(pcd),
            size: JSON.stringify(size),
        };

        if (search && search.trim() !== '') {
            params.search = search;
        }

        return this.http.get<any[]>(`${this.filteredItemApiUrl}?db=${dbParam}`, {
            params
        });
    }
}
