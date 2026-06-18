import { getAdjacentFacilities } from "@/data/facility-adjacency";

describe("facility adjacency", () => {
  it("returns neighboring ARTCC centers for a center query", () => {
    const result = getAdjacentFacilities("ZSE");

    expect(result).toMatchObject({
      facility: { id: "ZSE", name: "Seattle Center", type: "center" },
      adjacentApproach: [],
      adjacentTowers: []
    });
    expect(result.adjacentCenters.map((facility) => facility.id)).toEqual(
      expect.arrayContaining(["ZAN", "ZLC", "ZOA", "ZMP"])
    );
  });

  it("returns parent center, regional TRACONs, and covered towers for an approach query", () => {
    const result = getAdjacentFacilities("S46");

    expect(result).toMatchObject({
      facility: { id: "S46", name: "Seattle Approach", type: "approach" },
      overlying: { id: "ZSE", name: "Seattle Center", type: "center" }
    });
    expect(result.adjacentCenters.map((facility) => facility.id)).toEqual(["ZSE"]);
    expect(result.adjacentApproach.map((facility) => facility.id)).toEqual(
      expect.arrayContaining(["NUW", "P80"])
    );
    expect(result.adjacentTowers.map((facility) => facility.id)).toEqual(
      expect.arrayContaining(["KBFI-TWR", "KSEA-TWR", "KTCM-TWR"])
    );
  });

  it("returns overlying TRACON, sibling towers, and center for a tower query", () => {
    const result = getAdjacentFacilities("KSEA-TWR");

    expect(result).toMatchObject({
      facility: { id: "KSEA-TWR", name: "Seattle-Tacoma Tower", type: "tower" },
      overlying: { id: "S46", name: "Seattle Approach", type: "approach" }
    });
    expect(result.adjacentCenters.map((facility) => facility.id)).toEqual(["ZSE"]);
    expect(result.adjacentApproach).toEqual([{ id: "S46", name: "Seattle Approach" }]);
    expect(result.adjacentTowers.map((facility) => facility.id)).toEqual(
      expect.arrayContaining(["KBFI-TWR", "KPAE-TWR", "KRNT-TWR"])
    );
    expect(result.adjacentTowers.map((facility) => facility.id)).not.toContain("KSEA-TWR");
  });
});
