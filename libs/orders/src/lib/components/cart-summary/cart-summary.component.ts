import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'orders-cart-summary',
  templateUrl: './cart-summary.component.html',
  styles: []
})
export class CartSummaryComponent implements OnInit, OnDestroy {
  endSubs$: Subject<any> = new Subject();
  totalPrice: number;
  isCheckout = false;
  disabledCheckoutBtn = false;

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService,
    private router: Router,
  ) {
    this.router.url.includes('checkout') ? this.isCheckout = true : this.isCheckout = false;
    this.cartService.cart$.subscribe(cart => cart?.items?.length > 0 ? this.disabledCheckoutBtn = false : this.disabledCheckoutBtn = true)
  }

  ngOnInit(): void {
    this._getOrderSummary();
  }

  ngOnDestroy(): void {
    this.endSubs$.next;
    this.endSubs$.complete();
  }

  _getOrderSummary() {
    this.cartService.cart$.pipe(takeUntil(this.endSubs$)).subscribe((cart) => {
      this.totalPrice = 0;
      if(cart) {
        cart.items.map((item) => {
          this.ordersService
            .getProduct(item.productId)
            .pipe(take(1))
            .subscribe((product) => {
              this.totalPrice += product.price * item.quantity;
            })
          }
        )
      }
    })
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout'])
  }
}