const ROLLBAR_ENDPOINT = "https://api.rollbar.com/api/1/sourcemap";
export const postRollbarSourcemap = async (body: FormData): Promise<Response> => {
  const res = await fetch(ROLLBAR_ENDPOINT, { method: "POST", body });
  return res;
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;

  describe("postRollbarSourcemap", () => {
    it("should post sourcemap to Rollbar", async () => {
      vi.spyOn(global, "fetch").mockImplementation(
        async () => new Response('{ "key": "value" }', { status: 200 }),
      );
      const form = new FormData();
      const res = await postRollbarSourcemap(form);
      expect(global.fetch).toBeCalledWith(ROLLBAR_ENDPOINT, {
        method: "POST",
        body: form,
      });
      expect(res.ok).toBe(true);
    });
  });
}
