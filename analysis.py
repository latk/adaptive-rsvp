#!/usr/bin/env python3

import scipy  # type: ignore
import scipy.stats  # type: ignore
import json
import math
from typing import Dict, List, Tuple


def main():
    demographics, answers, texts = load_data()

    analyze_comprehension(answers=answers, texts=texts)


def load_data() -> Tuple[Dict[str, dict], List[dict], List[dict]]:
    with open('data/text-order.json') as f:
        text_order = {}
        for entry in json.load(f):
            text_order[entry['uid']] = entry['textOrder']

    with open('data/answers.json') as f:
        answers = []
        for entry in json.load(f):
            index = entry.pop('passage')
            try:
                entry['textID'] = text_order[entry['uid']][index]
            except KeyError:
                entry['textID'] = None
            answers.append(entry)

    with open('data/texts.json') as f:
        texts = json.load(f)

    with open('data/demographics.json') as f:
        demographics = {}
        for entry in json.load(f):
            demographics[entry['uid']] = entry

    return (demographics, answers, texts)


def analyze_comprehension(*, answers, texts) -> None:
    print()
    print("Do comprehension scores differ between automatic and manual adaption?")
    print("=====================================================================")
    print()
    print("In the following, a Bayes factor is used to select between the two hypotheses.")
    print("H0: the comprehension scores form a single combined distribution,")
    print("    i.e. there is no difference.")
    print("H1: the comprehension scores form separate distributions for automatic/manual")
    print()

    automatic_correct = 0
    automatic_total = 0
    manual_correct = 0
    manual_total = 0
    for answer in answers:
        textID = answer['textID']
        if textID is None:
            continue
        text = texts[textID]
        correct = answer['answer'] == text['expectedAnswer']
        if text['automaticSpeed']:
            automatic_correct += correct
            automatic_total += 1
        else:
            manual_correct += correct
            manual_total += 1

    combined_correct = automatic_correct + manual_correct
    combined_total = automatic_total + manual_total

    # so what is the expected probability of a correct answer?
    p_automatic = automatic_correct / automatic_total
    p_manual = manual_correct / manual_total
    p_combined = combined_correct / combined_total

    # assuming a Binomial distribution,
    # what is the likelihood of observing this data?
    # p(D|M)
    pdm_automatic = scipy.stats.binom.pmf(automatic_correct, automatic_total, p_automatic)
    pdm_manual = scipy.stats.binom.pmf(manual_correct, manual_total, p_manual)
    pdm_separate = pdm_automatic * pdm_manual
    pdm_combined = scipy.stats.binom.pmf(combined_correct, combined_total, p_combined)

    # likelihood ratio
    if pdm_combined > pdm_separate:
        K_favors_what = 'combined'
        K = pdm_combined / pdm_separate
    else:
        K_favors_what = 'separate'
        K = pdm_separate / pdm_combined

    logK = math.log10(K)
    conclusion = interpret_bayes_factor(logK=logK)

    print(f"automatic: {automatic_correct:3} of {automatic_total:3}, {p_automatic:3.2%}")
    print(f"manual:    {manual_correct:3} of {manual_total:3}, {p_manual:3.2%}")
    print(f"combined:  {combined_correct:3} of {combined_total:3}, {p_combined:3.2%}")
    print(f"likelihood separate: {pdm_separate:e} (automatic {pdm_automatic:e} manual {pdm_manual:e})")
    print(f"likelihood combined: {pdm_combined:e}")
    print(f"Bayes ratio favoring {K_favors_what}: K = {K}, log10(K) = {math.log10(K):.2f}")
    print(f"conclusion: {conclusion} evidence to support {K_favors_what} model")


def interpret_bayes_factor(*, logK: float) -> str:
    if logK < 0:
        return 'negative'
    if logK < 0.5:
        return 'weak'
    if logK < 1:
        return 'substantial'
    if logK < 2:
        return 'strong'
    return 'decisive'


if __name__ == '__main__':
    main()
