(function () {
  var template = document.createElement("template");
  template.innerHTML =
    '<style>' +
    ':host{display:block;font-family:Arial,sans-serif;}' +
    '.wrap{display:flex;gap:8px;align-items:center;height:100%;padding:4px;box-sizing:border-box;}' +
    'input{flex:1;height:32px;padding:0 8px;border:1px solid #89919a;border-radius:4px;font-size:14px;}' +
    'button{height:32px;padding:0 16px;border:1px solid #0a6ed1;background:#0a6ed1;color:#fff;border-radius:4px;cursor:pointer;font-size:14px;}' +
    '</style>' +
    '<div class="wrap"><input id="q" type="text" placeholder="Ask a question about spend..."/>' +
    '<button id="b">Ask</button></div>';

  class AskBox extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: "open" });
      this._shadow.appendChild(template.content.cloneNode(true));
      this._props = { question: "" };
      var self = this;
      this._shadow.getElementById("b").addEventListener("click", function () {
        var v = self._shadow.getElementById("q").value;
        self._props.question = v;
        self.dispatchEvent(new CustomEvent("propertiesChanged", {
          detail: { properties: { question: v } }
        }));
        self.dispatchEvent(new Event("onAsk"));
      });
    }
    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = Object.assign({}, this._props, changedProperties);
    }
    onCustomWidgetAfterUpdate(changedProperties) {
      if ("question" in changedProperties) {
        this._shadow.getElementById("q").value = changedProperties.question;
      }
    }
  }
  customElements.define("com-ibm-impact-askbox", AskBox);
})();
