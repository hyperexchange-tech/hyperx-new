import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyAccountRequest {
  accountNumber: string;
  bankCode: string;
}

interface VerifyAccountResponse {
  success: boolean;
  accountName?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { accountNumber, bankCode }: VerifyAccountRequest = await req.json();

    if (!accountNumber || !bankCode) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Account number and bank code are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (accountNumber.length !== 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid account number. Must be 10 digits",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const sampleAccounts: Record<string, Record<string, string>> = {
      "GTB": {
        "0123456789": "John Adekunle Okonkwo",
        "9876543210": "Amaka Chioma Nwosu",
      },
      "UBA": {
        "1234567890": "Ibrahim Musa Ahmed",
        "0987654321": "Folake Oluwaseun Williams",
      },
      "ZENITH": {
        "5555555555": "Chukwuemeka Nnamdi Igwe",
        "4444444444": "Blessing Adaeze Okoro",
      },
      "FIRST": {
        "7777777777": "Oluwaseyi Tunde Balogun",
        "8888888888": "Ngozi Chidinma Eze",
      },
      "ACCESS": {
        "3333333333": "Abdullahi Yusuf Hassan",
        "2222222222": "Grace Oluwatoyin Adeyemi",
      },
    };

    const accountName = sampleAccounts[bankCode]?.[accountNumber];

    if (accountName) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return new Response(
        JSON.stringify({
          success: true,
          accountName,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not verify account. Please check account number and bank",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to verify account",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
