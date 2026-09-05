/**
 * Listing CRUD, status transitions, and hybrid live-edit rules
 * (critical fields re-enter pending_review — see ADR-008).
 */
export const listingService = {
  async create(_landlordId: string, _input: unknown): Promise<never> {
    throw new Error("listingService.create is not implemented");
  },
  async update(_id: string, _landlordId: string, _input: unknown): Promise<never> {
    throw new Error("listingService.update is not implemented");
  },
  async softDelete(_id: string, _landlordId: string): Promise<never> {
    throw new Error("listingService.softDelete is not implemented");
  },
  async getById(_id: string): Promise<never> {
    throw new Error("listingService.getById is not implemented");
  },
  async listMine(_landlordId: string): Promise<never> {
    throw new Error("listingService.listMine is not implemented");
  },
};
