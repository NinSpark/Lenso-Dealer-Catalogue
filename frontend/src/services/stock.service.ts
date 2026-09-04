import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StockService {
    // private domain = "http://localhost:3000";
    private domain = "https://mcq5cp7n-3004.asse.devtunnels.ms";

    private itemApiUrl = `${this.domain}/api/item`;
    private itemPCDUrl = `${this.domain}/api/item-category`;
    private filteredItemApiUrl = `${this.domain}/api/filtered-item`;
    private stockApiUrl = `${this.domain}/api/stock`;
    private weightApiUrl = `${this.domain}/api/item-weight`;
    private getSecuredLoginUrl = `${this.domain}/secured-sales-login`;
    private getDealerSecuredLoginUrl = `${this.domain}/secured-dealer-login`;
    private updateShoppingCartUrl = `${this.domain}/api/update-shopping-cart`;
    private createUserUrl = `${this.domain}/create-dealer`;
    private changePasswordUrl = `${this.domain}/change-password`;

    constructor(private http: HttpClient) { }

    changePassword(username: string, newPassword: string): Observable<{ success: boolean; message?: string }> {
        return this.http.post<{ success: boolean; message?: string }>(this.changePasswordUrl, {
            username,
            newPassword,
        });
    }

    registerDealer(dealer_code: string, company_name: string, username: string, email: string, phone: string, is_active: boolean, password: string, sales_agent: string) {
        const body = { dealer_code, company_name, username, email, phone, is_active, password, sales_agent };
        return this.http.post<any>(this.createUserUrl, body);
    }

    getDealerSecuredLoginDetails(username: string, password: string) {
        const body = { username, password };
        return this.http.post<any>(this.getDealerSecuredLoginUrl, body);
    }

    updateShoppingCart(id: number, shopping_cart: any) {
        const body = { shopping_cart };
        return this.http.put<any>(`${this.updateShoppingCartUrl}/${id}`, body);
    }

    getPCDList(): Observable<any[]> {
        const url = `${this.itemPCDUrl}?db=lenso`;
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
