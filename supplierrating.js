(function () {
  var template = document.createElement("template");
  template.innerHTML =
    '<style>' +
    ':host{display:block;font-family:Arial,sans-serif;}' +
    '.card{height:100%;box-sizing:border-box;padding:10px 12px;overflow:auto;background:#fff;border:1px solid #d9d9d9;border-radius:8px;}' +
    '.title{font-size:14px;font-weight:bold;color:#1d2d3e;margin-bottom:6px;}' +
    '.row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;}' +
    '.row:last-child{border-bottom:none;}' +
    '.left{display:flex;align-items:center;gap:8px;min-width:0;}' +
    '.rank{width:20px;height:20px;border-radius:50%;background:#0a6ed1;color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none;}' +
    '.name{font-size:13px;color:#1d2d3e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.val{font-size:11px;color:#6a6d70;}' +
    '.stars{flex:none;white-space:nowrap;}' +
    '.star{font-size:20px;cursor:pointer;color:#c9c9c9;padding:0 1px;user-select:none;}' +
    '.star.on{color:#f5a623;}' +
    '.empty{font-size:12px;color:#6a6d70;padding:8px 0;}' +
    '</style>' +
    '<div class="card"><div class="title">Top suppliers - rate them</div><div id="list"></div></div>';

  class SupplierRating extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.appendChild(template.content.cloneNode(true));
      this._props = { suppliersJson: "[]", ratingsJson: "{}", lastSupplier: "", lastRating: 0 };
      this._ratings = {};
      this._suppliers = [];
    }
    onCustomWidgetBeforeUpdate(changed) {
      this._props = Object.assign({}, this._props, changed);
    }
    onCustomWidgetAfterUpdate(changed) {
      if ("suppliersJson" in changed) {
        try { this._suppliers = JSON.parse(this._props.suppliersJson || "[]"); } catch (e) { this._suppliers = []; }
      }
      if ("ratingsJson" in changed) {
        try { this._ratings = JSON.parse(this._props.ratingsJson || "{}"); } catch (e) { this._ratings = {}; }
      }
      this._render();
    }
    _stored() {
      try {
        var s = window.localStorage.getItem("ibmImpactSupplierRatings");
        if (s) { return JSON.parse(s); }
      } catch (e) {}
      return null;
    }
    _save() {
      try { window.localStorage.setItem("ibmImpactSupplierRatings", JSON.stringify(this._ratings)); } catch (e) {}
    }
    _render() {
      var self = this;
      var list = this._shadow.getElementById("list");
      list.innerHTML = "";
      if (!this._suppliers.length) {
        var em = document.createElement("div");
        em.className = "empty";
        em.textContent = "No suppliers to show yet.";
        list.appendChild(em);
        return;
      }
      var saved = this._stored();
      if (saved) { this._ratings = Object.assign({}, saved, this._ratings); }
      this._suppliers.forEach(function (s, idx) {
        var row = document.createElement("div");
        row.className = "row";
        var left = document.createElement("div");
        left.className = "left";
        var rank = document.createElement("div");
        rank.className = "rank";
        rank.textContent = String(idx + 1);
        var box = document.createElement("div");
        box.style.minWidth = "0";
        var nm = document.createElement("div");
        nm.className = "name";
        nm.textContent = s.name;
        var vl = document.createElement("div");
        vl.className = "val";
        vl.textContent = s.value || "";
        box.appendChild(nm);
        box.appendChild(vl);
        left.appendChild(rank);
        left.appendChild(box);
        var stars = document.createElement("div");
        stars.className = "stars";
        var cur = self._ratings[s.id] || 0;
        for (var i = 1; i <= 5; i++) {
          (function (n) {
            var st = document.createElement("span");
            st.className = "star" + (n <= cur ? " on" : "");
            st.textContent = "★";
            st.addEventListener("click", function () {
              var now = self._ratings[s.id] || 0;
              var next = (now === n) ? 0 : n;
              self._ratings[s.id] = next;
              self._save();
              self._props.lastSupplier = s.id;
              self._props.lastRating = next;
              self._props.ratingsJson = JSON.stringify(self._ratings);
              self.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: { properties: { lastSupplier: s.id, lastRating: next, ratingsJson: self._props.ratingsJson } }
              }));
              self.dispatchEvent(new Event("onRate"));
              self._render();
            });
            stars.appendChild(st);
          })(i);
        }
        row.appendChild(left);
        row.appendChild(stars);
        list.appendChild(row);
      });
    }
  }
  customElements.define("com-ibm-impact-supplierrating", SupplierRating);
})();
