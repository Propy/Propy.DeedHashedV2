// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract DeedHashedTypes {

    enum TokenStatus {
      InitialSetup,
      InitialDocuments,
      TitleAndEscrow,
      InspectionsAndDisclosures,
      ClosingStatements,
      Payment,
      DeedAndFinalDocuments,
      Complete
    }

}