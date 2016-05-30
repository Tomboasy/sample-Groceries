import {Component, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform} from "@angular/core";
import {Grocery} from "../../shared/grocery/grocery";
import {GroceryStore} from "../../shared/grocery/grocery-list.service";
import {Observable, BehaviorSubject} from "rxjs/Rx";

declare var UIColor: any;

@Pipe({
  name: "itemStatus"
})
export class ItemStatusPipe implements PipeTransform {
  value: Array<Grocery> = [];
  constructor(private _ref: ChangeDetectorRef) {}
  transform(items: Array<Grocery>, deleted: boolean) {
    if (items && items.length) {
      this.value = items.filter((grocery: Grocery) => {
        return grocery.deleted == deleted;
      });
      this._ref.markForCheck();
    }
    return this.value;
  }
}

@Component({
  selector: "GroceryList",
  templateUrl: "pages/list/grocery-list.html",
  styleUrls: ["pages/list/grocery-list.css"],
  pipes: [ItemStatusPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroceryList {
  @Input() showDeleted: boolean;
  @Input() row;

  @Output() loading = new EventEmitter();
  @Output() loaded = new EventEmitter();

  listLoaded = false;

  constructor(private store: GroceryStore) {
    this.load();
  }

  load() {
    this.loading.emit("loading");
    this.store.load()
      .subscribe(() => {
        this.loaded.emit("loaded");
        this.listLoaded = true;
      });
  }

  // The following trick makes the background color of each cell
  // in the UITableView transparent as it’s created.
  makeBackgroundTransparent(args) {
    let cell = args.ios;
    if (cell) {
      cell.backgroundColor = UIColor.clearColor();
    }
  }

  imageSource(grocery) {
    if (grocery.deleted) {
      return grocery.done ? "res://selected" : "res://nonselected"
    }
    return grocery.done ? "res://checked" : "res://unchecked";
  }

  toggleDone(grocery: Grocery) {
    if (grocery.deleted) {
      grocery.done = !grocery.done;
      return;
    }

    this.loading.emit("loading");
    this.store.toggleDoneFlag(grocery)
      .subscribe(() => {
        this.loaded.emit("loaded");
      }, () => {
        alert("An error occurred managing your grocery list.");
        this.loaded.emit("loaded");
      });
  }

  delete(grocery: Grocery) {
    this.loading.emit("loading");
    this.store.setDeleteFlag(grocery)
      .subscribe(
        () => this.loaded.emit("loaded"),
        () => {
          alert("An error occurred while deleting an item from your list.");
          this.loaded.emit("loaded");
        }
      );
  }
}
