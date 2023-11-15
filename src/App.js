import { useState, useEffect } from "react";

// TODO: defaultCurency not working

export default function App() {
  const [fromCurrency, setFromCurrency] = useState(1);
  const [toCurrency, setToCurrency] = useState(0);
  const [conversionString, setConversionString] = useState("");
  const [fromUnits, setFromUnits] = useState("USD");
  const [toUnits, setToUnits] = useState("EUR");
  const [isLoading, setIsLoading] = useState(false); // true while fetching
  const [error, setError] = useState(""); // Error string if any

  //const CONVERSIONS = ["USD", "EUR", "CAD", "INR"];

  useEffect(
    function fetchConversion() {
      function getResult(dataObj, toUnits) {
        if (toUnits === "USD") {
          return dataObj.rates.USD;
        } else if (toUnits === "EUR") {
          return dataObj.rates.EUR;
        } else if (toUnits === "CAD") {
          return dataObj.rates.CAD;
        } else if (toUnits === "INR") {
          return dataObj.rates.INR;
        }
        return dataObj.rates.USD;
      }

      // This API allows us to abort the request in a cleanup function
      // when a second request comes in while this one is running.
      // To do this, we pass controller.signal in the fetch request,
      // and use the cleanup function to abort the request: that happens
      // when a new request comes in BEFORE the current one has completed.
      const controller = new AbortController();

      async function fetchConversion() {
        try {
          setIsLoading(true);
          setError("");
          console.log(
            "Converting: ",
            fromCurrency,
            " from",
            fromUnits,
            " to:",
            toUnits
          );
          const res = await fetch(
            `https://api.frankfurter.app/latest?amount=${fromCurrency}&from=${fromUnits}&to=${toUnits}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something Went Wrong: Unable to convert!");
          }

          const data = await res.json();
          if (data.Response === "False")
            throw new Error("Currency Conversion Failed!");

          //          const result = data?.rates.{toCurrency};
          //          console.log(`Result: ${result} in ${toCurrency} using ${resultStr}`);
          var result = getResult(data, toUnits);
          console.log(result);
          console.log(result);

          setToCurrency(result);
          //setToCurrency(result);
          setConversionString(
            ` Converted ${data.base} using ${data.rates} on ${data.date}`
          );
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
            setToCurrency(0);
          }
        } finally {
          setIsLoading(false);
          console.log("...done fetching Conversion:", toCurrency);
        }
      }
      fetchConversion();

      return function () {
        console.log("Unmount");
      };
    },
    [fromCurrency, toCurrency, fromUnits, toUnits]
  );

  function handleCurrencyChanged(value) {
    console.log("Currency Changed to:", value);
    setFromCurrency(value);
  }

  function handleFromChanged(value) {
    console.log("From Changed to: ", value);
    setFromUnits(value);
  }

  function handleToChanged(value) {
    console.log("  To Changed to: ", value);
    setToUnits(value);
  }

  return (
    <div>
      <CurrencyValue
        value={fromCurrency}
        disabled={false}
        onChange={handleCurrencyChanged}
      ></CurrencyValue>
      <CurrencySelector currency={fromUnits} onChange={handleFromChanged} />
      <CurrencySelector currency={toUnits} onChange={handleToChanged} />

      <p>
        <CurrencyValue value={toCurrency}>
          disabled={true}
          {conversionString}
        </CurrencyValue>
      </p>
    </div>
  );
}

function CurrencyValue({ disabled, value, onChange }) {
  return (
    <input
      type="text"
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function CurrencySelector({ currency, onChange }) {
  return (
    <select value={currency} onChange={(e) => onChange(e.target.value)}>
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="CAD">CAD</option>
      <option value="INR">INR</option>
    </select>
  );
}
