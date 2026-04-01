return (
  <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

    {/* Top Message */}
    {message && (
      <div className={`rounded-lg px-4 py-3 text-sm border ${
        message.type === "success"
          ? "bg-green-900/40 border-green-700 text-green-300"
          : "bg-red-900/40 border-red-700 text-red-300"
      }`}>
        {message.text}
      </div>
    )}

    {/* ACCOUNT CARD */}
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

      <div>
        <p className="text-xs text-gray-400 uppercase mb-1">email</p>
        <p className="text-white">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase mb-1">plan</p>
        <span className={`inline-block px-3 py-1 text-xs rounded-full ${
          isPro
            ? "bg-purple-600/20 text-purple-300 border border-purple-600/40"
            : "bg-gray-700 text-gray-300"
        }`}>
          {planLabel}
        </span>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase mb-2">integrations</p>

        {isPro ? (
          <p className="text-white">unlimited</p>
        ) : (
          <div className="space-y-2">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${Math.min((usedIntegrations / MAX_FREE_INTEGRATIONS) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {usedIntegrations} / {MAX_FREE_INTEGRATIONS}
            </p>
          </div>
        )}
      </div>

      {/* Billing */}
      <div className="pt-2">
        {!isPro && !justPurchased ? (
          <div className="flex gap-2">
            <button
              onClick={() => startCheckout("subscription")}
              disabled={loadingPlan !== null}
              className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
            >
              {loadingPlan === "subscription" ? "loading..." : "subscribe"}
            </button>

            <button
              onClick={() => startCheckout("lifetime")}
              disabled={loadingPlan !== null}
              className="px-4 py-2 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition"
            >
              {loadingPlan === "lifetime" ? "loading..." : "lifetime"}
            </button>
          </div>
        ) : (
          stripeCustomerId && (
            <button
              onClick={manageBilling}
              disabled={loadingPlan !== null}
              className="px-4 py-2 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition"
            >
              {loadingPlan ? "opening..." : "manage billing"}
            </button>
          )
        )}
      </div>
    </div>

    {/* CLI SECTION (your upgraded version stays here) */}
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">
        CLI Access
      </h2>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm space-y-4">

        {cliAuthToken ? (
          <>
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                api key
              </p>

              <div className="flex items-center justify-between bg-black/40 border border-gray-700 rounded-lg px-3 py-2">
                <code className="text-sm text-gray-200">
                  sk_live_****...{cliAuthToken.slice(-4)}
                </code>

                <button
                  onClick={handleCopyToken}
                  className="text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  copy
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateToken}
                disabled={isGeneratingToken}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingToken ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    generating...
                  </>
                ) : (
                  "regenerate key"
                )}
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-3">
              no api key yet — generate one to connect the cli
            </p>

            <button
              onClick={handleGenerateToken}
              disabled={isGeneratingToken}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
            >
              generate api key
            </button>
          </div>
        )}

        {toastMessage && (
          <div className="text-xs text-green-400 bg-green-900/40 border border-green-700 px-3 py-2 rounded-md inline-block">
            {toastMessage}
          </div>
        )}

        {tokenError && (
          <p className="text-sm text-red-400">{tokenError}</p>
        )}
      </div>
    </section>

  </div>
);
